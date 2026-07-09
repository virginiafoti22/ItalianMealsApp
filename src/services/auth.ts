
export interface AuthUser {
  email: string;
  name: string;
  avatarUri: string;
}


export interface MockUser extends AuthUser {
  password: string;
}


export const MOCK_USERS: MockUser[] = [
  {
    email: "mario.rossi@student.it",
    password: "React2026!",
    name: "Mario Rossi",
    avatarUri: "https://picsum.photos/seed/mario-rossi/128",
  },
  {
    email: "giulia.bianchi@student.it",
    password: "Expo2026!",
    name: "Giulia Bianchi",
    avatarUri: "https://picsum.photos/seed/giulia-bianchi/128",
  },
  {
    email: "luca.verdi@student.it",
    password: "Mobile2026!",
    name: "Luca Verdi",
    avatarUri: "https://picsum.photos/seed/luca-verdi/128",
  },
];

export function validateLogin(email: string, password: string,): AuthUser | undefined {
  const match = MOCK_USERS.find(
    (user) => user.email === email.trim() && user.password === password,
  );
  if (!match) return undefined;

  const { password: _password, ...user } = match;
  return user;
}
