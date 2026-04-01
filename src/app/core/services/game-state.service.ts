import { Injectable, inject } from "@angular/core";
import { MlbService } from "./mlb.service";
import { defer, forkJoin, timer } from "rxjs";
import { expand, map, switchMap } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";

const LIVE_POLL_INTERVAL_MS = 20_000;
const IDLE_POLL_INTERVAL_MS = 5 * 60_000;

@Injectable({ providedIn: 'root' })
export class GameStateService {

  mlbService = inject(MlbService);

  private readonly fetchOnce$ = defer(() => this.mlbService.getTodaySchedule()).pipe(
    switchMap(response => {
      const games = response.dates.flatMap(date => date.games);
      const liveGame = games.find(game => game.status.abstractGameState === 'Live');
      const previewGame = games.find(game => game.status.abstractGameState === 'Preview');
      const finalGame = games.find(game => game.status.abstractGameState === 'Final');

      if (liveGame || previewGame) {
        return this.mlbService.getRecentGames().pipe(
          map(recentResponse => {
            const previousGame = recentResponse.dates
              .flatMap(date => date.games)
              .filter(game => game.status.abstractGameState === 'Final').pop();
            return {
              currentOrNextGame: liveGame || previewGame,
              lastCompletedGame: previousGame || null,
            };
          })
        );
      }

      if (finalGame) {
        return this.mlbService.getNextGame().pipe(
          map(nextResponse => {
            const nextGame = nextResponse.dates
              .flatMap(date => date.games)
              .find(game => game.status.abstractGameState === 'Preview');
            return {
              currentOrNextGame: nextGame || null,
              lastCompletedGame: finalGame,
            };
          })
        );
      }

      return forkJoin({
        recentResponse: this.mlbService.getRecentGames(),
        nextResponse: this.mlbService.getNextGame(),
      }).pipe(
        map(({ recentResponse, nextResponse }) => {
          const previousGame = recentResponse.dates
            .flatMap(date => date.games)
            .filter(game => game.status.abstractGameState === 'Final').pop();
          const nextGame = nextResponse.dates
            .flatMap(date => date.games)
            .find(game => game.status.abstractGameState === 'Preview');
          return {
            currentOrNextGame: nextGame || null,
            lastCompletedGame: previousGame || null,
          };
        })
      );
    })
  );

  readonly homePageGames$ = this.fetchOnce$.pipe(
    expand(value => {
      const isLive = value.currentOrNextGame?.status.abstractGameState === 'Live';
      return timer(isLive ? LIVE_POLL_INTERVAL_MS : IDLE_POLL_INTERVAL_MS).pipe(
        switchMap(() => this.fetchOnce$)
      );
    })
  );

  readonly homePageGames = toSignal(this.homePageGames$, { initialValue: null });
}
