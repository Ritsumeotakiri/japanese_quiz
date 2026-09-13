declare global {
  namespace App {
    interface Platform {
      env: {
        DB?: {
          prepare: (query: string) => {
            bind: (...values: unknown[]) => {
              all: <T>() => Promise<{ results: T[] }>
              run: () => Promise<unknown>
            }
            run: () => Promise<unknown>
          }
        }
      }
    }
  }
}

export {}
