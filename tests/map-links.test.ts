import { describe, expect, it } from 'vitest';
import { googleMapsAttractionUrl, googleMapsSearchUrl } from '../src/services/maps/web-map-links';

describe('map links', () => {
  it('builds normal Google Maps search URLs', () => {
    expect(googleMapsSearchUrl('서울역 1호선')).toBe(
      'https://www.google.com/maps/search/?api=1&query=%EC%84%9C%EC%9A%B8%EC%97%AD%201%ED%98%B8%EC%84%A0',
    );
  });

  it('uses only the curated attraction target without adding a nearby station', () => {
    const url = googleMapsAttractionUrl(
      '경인아라뱃길 시천가람터',
      '시천가람터 인천광역시 서구 시천동 158-11',
    );
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('시천가람터 인천광역시 서구 시천동 158-11');
    expect(decoded).not.toContain('검암역');
  });
});
