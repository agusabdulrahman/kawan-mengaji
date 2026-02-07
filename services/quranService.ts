
import { ApiResponse, SurahShort, SurahDetail } from '../types';

const BASE_URL = 'https://equran.id/api/v2';

export const getSurahList = async (): Promise<SurahShort[]> => {
  const response = await fetch(`${BASE_URL}/surat`);
  const result: ApiResponse<SurahShort[]> = await response.json();
  return result.data;
};

export const getSurahDetail = async (nomor: number): Promise<SurahDetail> => {
  const response = await fetch(`${BASE_URL}/surat/${nomor}`);
  const result: ApiResponse<SurahDetail> = await response.json();
  return result.data;
};
