import { Component, Input, OnChanges, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Game, PitchingStats } from '../../models/mlb.models';
import { MlbService, PHILLIES_ID } from '../../../core/services/mlb.service';
import { shortTeamName } from '../../utils/game.utils';

@Component({
  selector: 'app-game-card',
  imports: [DatePipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent implements OnChanges {
  @Input() game: Game | null = null;

  homePitcherStats?: PitchingStats;
  awayPitcherStats?: PitchingStats;

  ngOnChanges(): void {
    this.homePitcherStats = undefined;
    this.awayPitcherStats = undefined;
    const homeId = this.game?.probablePitchers?.home?.id;
    const awayId = this.game?.probablePitchers?.away?.id;
    if (homeId) {
      this.mlbService.getPlayerStats(homeId, 'pitching').subscribe(res => {
        this.homePitcherStats = res.stats[0]?.splits[0]?.stat as PitchingStats;
      });
    }
    if (awayId) {
      this.mlbService.getPlayerStats(awayId, 'pitching').subscribe(res => {
        this.awayPitcherStats = res.stats[0]?.splits[0]?.stat as PitchingStats;
      });
    }
  }
  @Input() variant: 'previous' | 'current' = 'previous';

  mlbService = inject(MlbService);

  readonly philliesId = PHILLIES_ID;
  readonly inningNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  get isHome(): boolean {
    return this.game?.teams.home.team.id === PHILLIES_ID;
  }

  get philliesTeam() {
    return this.isHome ? this.game?.teams.home : this.game?.teams.away;
  }

  get opponentTeam() {
    return this.isHome ? this.game?.teams.away : this.game?.teams.home;
  }

  get philliesScore(): number | undefined {
    return this.philliesTeam?.score;
  }

  get opponentScore(): number | undefined {
    return this.opponentTeam?.score;
  }

  get philliesWon(): boolean {
    return this.philliesTeam?.isWinner === true;
  }

  get gameStatus(): string {
    return this.game?.status.abstractGameState ?? '';
  }

  get gameDate(): string {
    return new Date(this.game?.gameDate ?? '').toLocaleString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    });
  }

  getLinescoreForTeam(team: 'home' | 'away'): (string | number)[] {
    if (!this.game?.linescore?.innings) return [];
    return this.game.linescore.innings.map(inning => {
      const runs = team === 'home' ? inning.home?.runs : inning.away?.runs;
      return runs ?? '-';
    });
  }

  shortName = shortTeamName;

  get timezoneAbbr(): string {
    const date = new Date(this.game?.gameDate ?? '');
    return new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(date)
      .find(p => p.type === 'timeZoneName')?.value ?? '';
  }
}
