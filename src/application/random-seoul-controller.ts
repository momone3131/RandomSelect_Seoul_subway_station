import { getCuratedAttractions } from '../data/curated-attractions';
import { isAlcoholFoodId } from '../data/food-category-features';
import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID } from '../data/subway-lines';
import { drawOne, type RandomSource } from '../domain/draw-engine';
import { rankRestaurants } from '../domain/restaurant-ranking';
import type {
  AttractionSnapshot,
  DrawHistoryItem,
  FoodCategory,
  PlaceCandidate,
  RestaurantRecommendation,
  SubwayLine,
  VisitRecord,
} from '../domain/types';
import type { AppStore } from '../state/app-state';
import type { PlaceSearchService } from '../services/places/place-search';
import type { StationLocationService } from '../services/places/station-location';
const FOOD_PLACE_TYPES=new Set(['restaurant','cafe','bakery','meal_takeaway','meal_delivery','bar','food']);
const ALCOHOL_PLACE_TYPES=new Set(['bar','night_club','restaurant','food']);
export type DrawStage='line'|'station'|'food'|'done';
export interface DrawResult{stage:DrawStage;recommendations?:RestaurantRecommendation[];}
export interface VisitDraft {
 visitId?:string;
 sourceHistoryId?:string;
 lineId:string;
 stationName:string;
 stationOrdinal:number;
 drawnFoodId?:string;
 shownAttractions:readonly AttractionSnapshot[];
 includeFood:boolean;
 selectedAttractionIds:readonly string[];
 visitedAt?:string;
}
export class RandomSeoulController{
 private activeHistoryId?:string; private sequence=0;
 constructor(readonly store:AppStore,private readonly places:PlaceSearchService,private readonly stationLocations:StationLocationService,private readonly random:RandomSource=Math.random,private readonly now:()=>number=Date.now){}
 getStage():DrawStage{const state=this.store.getSnapshot();if(!state.currentLine)return'line';if(!state.currentStation)return'station';if(!state.currentFood)return'food';return'done';}
 async drawNext():Promise<DrawResult>{const stage=this.getStage();if(stage==='done'){this.store.resetCourse();this.activeHistoryId=undefined;return this.drawLineResult();}if(stage==='line')return this.drawLineResult();if(stage==='station')return this.drawStationResult();return this.drawFoodResult();}
 redrawLine():DrawResult{this.store.resetCourse();this.activeHistoryId=undefined;return this.drawLineResult();}
 redrawStation():DrawResult{const state=this.store.getSnapshot();if(!state.currentLine)return this.drawLineResult();this.store.update(current=>({...current,currentStation:undefined,currentFood:undefined,attractions:[],recommendations:[]}));this.activeHistoryId=undefined;return this.drawStationResult();}
 redrawFood():DrawResult{const state=this.store.getSnapshot();if(!state.currentLine)return this.drawLineResult();if(!state.currentStation)return this.drawStationResult();this.store.resetFood();return this.drawFoodResult();}
 setSelectedLines(ids:readonly string[]):void{const valid=ids.filter(id=>SUBWAY_LINE_BY_ID.has(id));if(!valid.length)throw new RangeError('At least one subway line must be selected.');this.store.update(state=>({...state,preferences:{...state.preferences,selectedLineIds:[...valid]},currentLine:undefined,currentStation:undefined,currentFood:undefined,attractions:[],recommendations:[]}));this.activeHistoryId=undefined;}
 setSelectedFoods(ids:readonly string[]):void{const valid=ids.filter(id=>FOOD_BY_ID.has(id));if(!valid.length)throw new RangeError('At least one food category must be selected.');this.store.update(state=>({...state,preferences:{...state.preferences,selectedFoodIds:[...valid]},currentFood:undefined,recommendations:[]}));}
 setInstantDraw(enabled:boolean):void{this.store.update(state=>({...state,preferences:{...state.preferences,instantDraw:enabled}}));}
 clearHistory():void{this.activeHistoryId=undefined;this.store.update(state=>({...state,history:[]}));}
 saveVisit(draft:VisitDraft):VisitRecord{
  const line=SUBWAY_LINE_BY_ID.get(draft.lineId);
  const station=line?.stations[draft.stationOrdinal-1];
  if(!line||!station||station.name!==draft.stationName)throw new RangeError('Visit station is invalid.');
  const drawnFoodId=draft.drawnFoodId&&FOOD_BY_ID.has(draft.drawnFoodId)?draft.drawnFoodId:undefined;
  const shownAttractions=this.normalizeAttractionSnapshots(draft.shownAttractions);
  const selectedIds=new Set(draft.selectedAttractionIds);
  const attractions=shownAttractions.filter(item=>selectedIds.has(item.id));
  const visitedAt=draft.visitedAt&&/^\d{4}-\d{2}-\d{2}$/.test(draft.visitedAt)?draft.visitedAt:undefined;
  const state=this.store.getSnapshot();
  const existing=draft.visitId
   ? state.visits.find(item=>item.id===draft.visitId)
   : draft.sourceHistoryId
    ? state.visits.find(item=>item.sourceHistoryId===draft.sourceHistoryId)
    : undefined;
  const visit:VisitRecord={
   id:existing?.id??this.nextVisitId(),
   ...(draft.sourceHistoryId||existing?.sourceHistoryId?{sourceHistoryId:draft.sourceHistoryId??existing?.sourceHistoryId}:{}),
   lineId:draft.lineId,
   stationName:draft.stationName,
   stationOrdinal:draft.stationOrdinal,
   drawnFoodId,
   foodId:draft.includeFood&&drawnFoodId?drawnFoodId:undefined,
   shownAttractions,
   attractions,
   visitedAt,
   createdAt:existing?.createdAt??this.now(),
  };
  this.store.update(current=>({
   ...current,
   visits:existing
    ? current.visits.map(item=>item.id===existing.id?visit:item)
    : [visit,...current.visits],
  }));
  return visit;
 }
 deleteVisit(id:string):void{this.store.update(state=>({...state,visits:state.visits.filter(item=>item.id!==id)}));}
 private drawLineResult():DrawResult{const state=this.store.getSnapshot();const candidates=state.preferences.selectedLineIds.map(id=>SUBWAY_LINE_BY_ID.get(id)).filter((line):line is SubwayLine=>Boolean(line));const line=drawOne(candidates,this.random);this.store.update(current=>({...current,currentLine:line,currentStation:undefined,currentFood:undefined,attractions:[],recommendations:[]}));return{stage:'line'};}
 private drawStationResult():DrawResult{const state=this.store.getSnapshot();if(!state.currentLine)return this.drawLineResult();const station=drawOne(state.currentLine.stations,this.random);const attractions=getCuratedAttractions(state.currentLine.id,station.name);this.activeHistoryId=this.nextHistoryId();const historyItem:DrawHistoryItem={
   id:this.activeHistoryId,
   lineId:state.currentLine.id,
   stationName:station.name,
   stationOrdinal:station.ordinal,
   attractionOptions:attractions.map(item=>({id:item.id,name:item.name})),
  };this.store.update(current=>({...current,currentStation:station,currentFood:undefined,attractions,recommendations:[],history:[historyItem,...current.history].slice(0,12)}));return{stage:'station'};}
 private drawFoodResult():DrawResult{const state=this.store.getSnapshot();if(!state.currentLine)return this.drawLineResult();if(!state.currentStation)return this.drawStationResult();const foods=state.preferences.selectedFoodIds.map(id=>FOOD_BY_ID.get(id)).filter((food):food is FoodCategory=>Boolean(food));const food=drawOne(foods,this.random);this.store.update(current=>({...current,currentFood:food,recommendations:[]}));this.attachFoodToHistory(food.id);return{stage:'food'};}
 async loadRecommendations():Promise<RestaurantRecommendation[]>{const state=this.store.getSnapshot();const line=state.currentLine,station=state.currentStation,food=state.currentFood;if(!line||!station||!food)return[];const center=await this.stationLocations.resolve(line,station.name);const query=`${station.name}역 ${food.searchQuery??food.name}`;const candidates=await this.places.searchText({textQuery:query,center:{latitude:center.latitude,longitude:center.longitude},radiusMeters:2000,maxResults:20,language:'ko',region:'kr'});const foodCandidates=candidates.filter(candidate=>this.isFoodCandidate(candidate,food));const recommendations=rankRestaurants(foodCandidates,center);this.store.update(current=>({...current,recommendations}));return recommendations;}
 private isFoodCandidate(candidate:PlaceCandidate,food:FoodCategory):boolean{const types=candidate.types??[];if(!types.length)return true;if(isAlcoholFoodId(food.id))return types.some(type=>ALCOHOL_PLACE_TYPES.has(type));if(food.id==='w_brunch'&&types.includes('cafe'))return true;return types.some(type=>FOOD_PLACE_TYPES.has(type));}
 private attachFoodToHistory(foodId:string):void{const activeId=this.activeHistoryId;this.store.update(current=>{if(!activeId)return current;return{...current,history:current.history.map(item=>item.id===activeId?{...item,foodId}:item)}});}
 private normalizeAttractionSnapshots(items:readonly AttractionSnapshot[]):AttractionSnapshot[]{
  const result:AttractionSnapshot[]=[];const seen=new Set<string>();
  for(const item of items){if(!item.id||!item.name||seen.has(item.id))continue;seen.add(item.id);result.push({id:item.id,name:item.name});}
  return result;
 }
 private nextHistoryId():string{this.sequence+=1;return`${this.now()}-${this.sequence}`;}
 private nextVisitId():string{this.sequence+=1;return`visit-${this.now()}-${this.sequence}`;}
}
