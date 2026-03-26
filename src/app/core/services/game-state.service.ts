import { Injectable, inject } from "@angular/core";
import { MlbService } from "./mlb.service";
import { forkJoin, map, switchMap } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

@Injectable({ providedIn: 'root' })
export class GameStateService {

  mlbService = inject(MlbService);

  readonly homePageGames$ = this.mlbService.getTodaySchedule().pipe(
    switchMap(response => {
      const games = response.dates.flatMap(date => date.games);
      const liveGame = games.find(game => game.status.abstractGameState === 'Live');
      const previewGame = games.find(game => game.status.abstractGameState === 'Preview');
      const finalGame = games.find(game => game.status.abstractGameState === 'Final');

      if (liveGame || previewGame) {
        // Live or upcoming game today — fetch previous game
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
        // Today's game is final — fetch next scheduled game
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

      // No game today — fetch both previous and next
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

  readonly homePageGames = toSignal(this.homePageGames$, { initialValue: null });
}
