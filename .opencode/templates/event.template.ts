export class {{Entity}}CreatedEvent {
  constructor(
    public readonly payload: {
      id: string;
      organizationId: string;
    },
  ) {}
}
