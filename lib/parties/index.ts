export type Party = {
  id: string;
  name: string;
  colour: string;
  textColour: string;
  leader: string;
  description: string;
  hasMP: boolean;
};

export const parties: Party[] = [
  { id: 'labour', name: 'Labour', colour: '#ffffff', textColour: '#ffffff', leader: 'Keir Starmer', description: 'Centre-left governing party', hasMP: true },
  { id: 'conservative', name: 'Conservative', colour: '#ffffff', textColour: '#ffffff', leader: 'Kemi Badenoch', description: 'Centre-right main opposition', hasMP: true },
  { id: 'reform', name: 'Reform UK', colour: '#ffffff', textColour: '#ffffff', leader: 'Nigel Farage', description: 'Right-wing populist party', hasMP: true },
  { id: 'libdem', name: 'Liberal Democrats', colour: '#ffffff', textColour: '#ffffff', leader: 'Ed Davey', description: 'Centrist party', hasMP: true },
  { id: 'green', name: 'Green Party', colour: '#ffffff', textColour: '#ffffff', leader: 'Zack Polanski', description: 'Left-wing environmentalist party', hasMP: true },
  { id: 'snp', name: 'SNP', colour: '#ffffff', textColour: '#002633', leader: 'John Swinney', description: 'Scottish nationalist party', hasMP: true },
  { id: 'plaid', name: 'Plaid Cymru', colour: '#ffffff', textColour: '#ffffff', leader: 'Rhun ap Iorwerth', description: 'Welsh nationalist party', hasMP: true },
  { id: 'yourparty', name: 'Your Party', colour: '#ffffff', textColour: '#ffffff', leader: 'Jeremy Corbyn', description: 'Socialist left party', hasMP: true },
  { id: 'dup', name: 'DUP', colour: '#ffffff', textColour: '#ffffff', leader: 'Gavin Robinson', description: 'Northern Ireland unionist party', hasMP: true },
  { id: 'sinnfein', name: 'Sinn Féin', colour: '#405b6b', textColour: '#ffffff', leader: 'Michelle O\'Neill', description: 'Irish republican party', hasMP: true },
  { id: 'sdlp', name: 'SDLP', colour: '#ffffff', textColour: '#ffffff', leader: 'Colum Eastwood', description: 'Nationalist social democratic party', hasMP: true },
  { id: 'alliance', name: 'Alliance', colour: '#ffffff', textColour: '#002633', leader: 'Naomi Long', description: 'Cross-community centrist party', hasMP: true },
  { id: 'tuv', name: 'TUV', colour: '#1c3849', textColour: '#ffffff', leader: 'Jim Allister', description: 'Traditional unionist party', hasMP: true },
  { id: 'uup', name: 'UUP', colour: '#ffffff', textColour: '#ffffff', leader: 'Doug Beattie', description: 'Ulster unionist party', hasMP: true },
  { id: 'restore', name: 'Restore Britain', colour: '#002633', textColour: '#ffffff', leader: 'Rupert Lowe', description: 'Right-wing populist party', hasMP: true },
  { id: 'others', name: 'Others', colour: '#405b6b', textColour: '#ffffff', leader: 'Various', description: 'UKIP, Alba and other parties with published policies', hasMP: false },
];
