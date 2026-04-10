import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Game, HittingStats, Linescore, PitchingStats, Player, StandingsRecord } from '../../shared/models/mlb.models';

const BASE_URL = 'https://statsapi.mlb.com/api/v1';
export const PHILLIES_ID = 143;
export const NL_EAST_ID = 204;
export const NL_ID = 104;

@Injectable({ providedIn: 'root' })
export class MlbService {
  private http = inject(HttpClient);

  private fetchMlb<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${BASE_URL}${path}`, { params }).pipe(
      catchError(err => throwError(() => new Error(err.message ?? 'MLB API request failed')))
    );
  }

  private localDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getTodaySchedule(): Observable<{ dates: { games: Game[] }[] }> {
    const today = this.localDateStr(new Date());
    const params = new HttpParams({ fromObject: {
      sportId: '1',
      teamId: PHILLIES_ID.toString(),
      startDate: today,
      endDate: today,
      hydrate: 'linescore,decisions,team'
    } });

    return this.fetchMlb('/schedule', params);
  }

  getNextGame(): Observable<{ dates: { games: Game[] }[] }> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Look up to a week ahead

    const params = new HttpParams({ fromObject: {
      sportId: '1',
      teamId: PHILLIES_ID.toString(),
      startDate: this.localDateStr(tomorrow),
      endDate: this.localDateStr(endDate),
      hydrate: 'linescore,decisions,team,probablePitcher,broadcasts'
    } });
    return this.fetchMlb('/schedule', params);
  }

  getRecentGames(): Observable<{ dates: { games: Game[] }[] }> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const past = new Date();
    past.setDate(past.getDate() - 19);

    const params = new HttpParams({ fromObject: {
      sportId: '1',
      teamId: PHILLIES_ID.toString(),
      startDate: this.localDateStr(past),
      endDate: this.localDateStr(yesterday),
      hydrate: 'linescore,decisions,team'
    } });
    return this.fetchMlb('/schedule', params);
  }

  getLineScore(gamePk: number): Observable<Linescore> {
    return this.fetchMlb(`/game/${gamePk}/linescore`);
  }
  getBoxScore(gamePk: number): Observable<any> {
    return this.fetchMlb(`/game/${gamePk}/boxscore`);
  }

  getNlEastStandings(): Observable<{ records: { teamRecords: StandingsRecord[] }[] }> {
    const params = new HttpParams({ fromObject: {
      leagueId: NL_ID.toString(),
      season: new Date().getFullYear().toString(),
      standingsType: 'regularSeason',
      hydrate: 'team,division'
    } });
    return this.fetchMlb('/standings', params);
  }

  getActiveRoster(): Observable<{ roster: Player[] }> {
    const params = new HttpParams({ fromObject: {
      rosterType: 'active',
      season: new Date().getFullYear().toString()
    } });
    return this.fetchMlb(`/teams/${PHILLIES_ID}/roster`, params);
  }

  getPlayerStats(playerId: number, group: 'hitting' | 'pitching' = 'hitting'): Observable<{ stats: { splits: { stat: HittingStats | PitchingStats }[] }[] }> {
    const params = new HttpParams({ fromObject: {
      stats: 'season',
      group: group,
      season: new Date().getFullYear().toString()
    } });
    return this.fetchMlb(`/people/${playerId}/stats`, params);
  }
}
