
export class DomRegistry {
  private static instance: DomRegistry;
  private elements: Map<string, HTMLElement> = new Map();

  private constructor() {}

  public static getInstance(): DomRegistry {
    if (!DomRegistry.instance) {
      DomRegistry.instance = new DomRegistry();
    }
    return DomRegistry.instance;
  }

  public register(id: string, element: HTMLElement) {
    this.elements.set(id, element);
  }

  public unregister(id: string) {
    this.elements.delete(id);
  }

  public get(id: string): HTMLElement | undefined {
    return this.elements.get(id);
  }
}

export const domRegistry = DomRegistry.getInstance();
