import type {
  DrawHistoryItem,
  FoodCategory,
  RestaurantRecommendation,
  SubwayLine,
  SubwayStation,
} from '../domain/types';

export interface AppPreferences {
  selectedLineIds: string[];
  selectedFoodIds: string[];
  instantDraw: boolean;
}

export interface AppState {
  preferences: AppPreferences;
  currentLine?: SubwayLine;
  currentStation?: SubwayStation;
  currentFood?: FoodCategory;
  recommendations: RestaurantRecommendation[];
  history: DrawHistoryItem[];
}

export type AppStateListener = (state: Readonly<AppState>) => void;

export class AppStore {
  private state: AppState;
  private readonly listeners = new Set<AppStateListener>();

  constructor(initialState: AppState) {
    this.state = initialState;
  }

  getSnapshot(): Readonly<AppState> {
    return this.state;
  }

  update(updater: (current: Readonly<AppState>) => AppState): void {
    this.state = updater(this.state);
    for (const listener of this.listeners) listener(this.state);
  }

  subscribe(listener: AppStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resetCourse(): void {
    this.update((current) => ({
      ...current,
      currentLine: undefined,
      currentStation: undefined,
      currentFood: undefined,
      recommendations: [],
    }));
  }

  resetFromStation(): void {
    this.update((current) => ({
      ...current,
      currentStation: undefined,
      currentFood: undefined,
      recommendations: [],
    }));
  }

  resetFood(): void {
    this.update((current) => ({
      ...current,
      currentFood: undefined,
      recommendations: [],
    }));
  }
}

export function createInitialState(
  lineIds: readonly string[],
  foodIds: readonly string[],
): AppState {
  return {
    preferences: {
      selectedLineIds: [...lineIds],
      selectedFoodIds: [...foodIds],
      instantDraw: false,
    },
    recommendations: [],
    history: [],
  };
}
