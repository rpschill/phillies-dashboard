import { Component, inject } from '@angular/core';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-home',
  imports: [GameCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private gameStateService = inject(GameStateService);

  homePageGames = this.gameStateService.homePageGames;
}
