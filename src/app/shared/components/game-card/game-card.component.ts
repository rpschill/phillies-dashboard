import { Component, Input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Game } from '../../models/mlb.models';
import { PHILLIES_ID } from '../../../core/services/mlb.service';
import { shortTeamName } from '../../utils/game.utils';

@Component({
  selector: 'app-game-card',
  imports: [DatePipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  @Input() game: Game | null = null;
  @Input() variant: 'previous' | 'current' = 'previous';

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

  shortName = shortTeamName;

  get timezoneAbbr(): string {
    const date = new Date(this.game?.gameDate ?? '');
    return new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(date)
      .find(p => p.type === 'timeZoneName')?.value ?? '';
  }
}
