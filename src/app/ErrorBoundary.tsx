import { Component, type ErrorInfo, type ReactNode } from 'react';
import { recordError } from './error-tracker';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    recordError({
      at: new Date().toISOString(),
      message: error.message,
      stack: [error.stack, info.componentStack].filter(Boolean).join('\n\n'),
    });
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="error-screen" role="alert">
        <h1>Aplikasi berhenti tak terduga</h1>
        <p>
          Data yang tersimpan di perangkat tidak terhapus. Muat ulang halaman untuk melanjutkan.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Muat ulang
        </button>
        <details>
          <summary>Detail teknis</summary>
          <pre>{this.state.error.message}</pre>
        </details>
      </div>
    );
  }
}
