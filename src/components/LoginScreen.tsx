import { useState, type FormEvent } from 'react';
import { useAuth } from '../state/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!login(code)) {
      setError(true);
      setCode('');
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__brand">
          <div className="brand__mark" />
          <div>
            <div className="brand__title">GO ON [OFF] SHORE</div>
            <div className="brand__subtitle">Architektura organizacji · AI-first CRM</div>
          </div>
        </div>
        <h1 className="login__title">Dostęp do platformy</h1>
        <p className="login__lead">Podaj hasło dostępu, aby wejść do platformy i edytować dane.</p>
        <label className="form-field">
          <span>Hasło dostępu</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="••••"
          />
        </label>
        {error && <p className="login__error">Nieprawidłowe hasło. Spróbuj ponownie.</p>}
        <button type="submit" className="btn btn--primary login__submit">
          Zaloguj się
        </button>
      </form>
    </div>
  );
}
