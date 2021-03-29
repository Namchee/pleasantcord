export interface StrikeDocument {
  readonly serverId: string;
  readonly userId: string;
  readonly count: number;
  readonly lastUpdated: Date;
  readonly deleted: boolean;
}

export class Strike {
  public constructor(
    public readonly serverId: string,
    public readonly userId: string,
    public readonly count: number,
    public readonly lastUpdated: Date,
    public readonly deleted: boolean,
  ) { }

  public hasExpired(ref: Date, expirationTime: number): boolean {
    return this.lastUpdated.getTime() + (expirationTime * 1000) <=
      ref.getTime();
  }

  public static fromDocument(
    { serverId, userId, count, lastUpdated, deleted }: StrikeDocument,
  ): Strike {
    return new Strike(serverId, userId, count, lastUpdated, deleted);
  }
}
