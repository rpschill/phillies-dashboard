const TWO_WORD_TEAMS: Record<string, string> = {
  'Boston Red Sox': 'Red Sox',
  'Chicago White Sox': 'White Sox',
  'Toronto Blue Jays': 'Blue Jays',
};

export function shortTeamName(fullName: string): string {
  return TWO_WORD_TEAMS[fullName] ?? fullName.split(' ').slice(-1)[0];
}
