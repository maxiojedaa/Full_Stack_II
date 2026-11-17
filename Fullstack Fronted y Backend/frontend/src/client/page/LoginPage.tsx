import React, { useState } from 'react';
import { usuarioAuthService } from '../../services/usuario-auth-service';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  

  const navigate = useNavigate(); // <-- Decláralo aquí
  const [modo, setModo] = useState<'login' | 'registro'>('login');

  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [nombreRegistro, setNombreRegistro] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [passwordRegistro, setPasswordRegistro] = useState('');
  const [passwordConfirmRegistro, setPasswordConfirmRegistro] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cargando, setCargando] = useState(false);





  // Cambiar de modo limpiando completamente los mensajes
  const cambiarModo = (nuevoModo: 'login' | 'registro') => {
    setModo(nuevoModo);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1. Intentando iniciar sesión...");
    setErrorMsg(''); // <-- Limpiamos el error al intentar de nuevo
    setSuccessMsg('');
    setCargando(true);

    try {
      // Ajustado según el DTO de login (password o contrasena según tu backend)
      const respuesta: any = await usuarioAuthService.login({
        email: emailLogin,
        password: passwordLogin,
      });

      console.log("2. Respuesta recibida del backend:", respuesta);


     
const usuario = respuesta.usuario;

if (!usuario || usuario.id == null) {
  throw new Error('El servidor no devolvió un usuario válido');
}

localStorage.setItem('token', respuesta.token);
localStorage.setItem('usuarioId', String(usuario.id));
localStorage.setItem('usuarioNombre', usuario.nombre);
localStorage.setItem('usuarioEmail', usuario.email);
localStorage.setItem('usuarioRol', usuario.rol);

      console.log("3. Ejecutando navigate('/catalogo')...");
      navigate('/catalogo');

    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      console.error('❌ Error capturado en el catch:', err); // Rastro de error
      setErrorMsg('Correo o contraseña incorrectos. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (passwordRegistro !== passwordConfirmRegistro) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await usuarioAuthService.registrar({
        nombre: nombreRegistro,
        email: emailRegistro,
        password: passwordRegistro,
        rol: 'CLIENTE'
      });

      setSuccessMsg('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => {
        cambiarModo('login');
      }, 2000);
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setErrorMsg('No se pudo crear la cuenta. Es posible que el correo ya esté registrado.');
    } finally {
      setCargando(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    backgroundColor: '#ffffff',
    color: '#2d3748',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: '420px',
          padding: '40px 35px',
          boxSizing: 'border-box',
        }}
      >
        {errorMsg && (
          <p style={{ color: '#e53e3e', fontSize: '13px', textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p style={{ color: '#38a169', fontSize: '13px', textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
            {successMsg}
          </p>
        )}

        {/* VISTA LOGIN */}
        {/* VISTA LOGIN */}
        {modo === 'login' ? (
          <div>
            <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '800', color: '#1a202c', marginTop: 0, marginBottom: '20px' }}>
              LOGIN
            </h1>

            {errorMsg && (
              <p style={{ color: '#e53e3e', fontSize: '13px', textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p style={{ color: '#38a169', fontSize: '13px', textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
                {successMsg}
              </p>
            )}

            {/* Quitamos el <form> y usamos un <div> normal */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '15px', color: '#2d3748', marginBottom: '8px' }}>
                Ingrese su email:
              </label>
              <input
                type="email"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                placeholder="Ingrese su email"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '15px', color: '#2d3748', marginBottom: '8px' }}>
                Password:
              </label>
              <input
                type="password"
                value={passwordLogin}
                onChange={(e) => setPasswordLogin(e.target.value)}
                placeholder="Ingrese su password"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '14px', color: '#2d3748', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>

            {/* Botón con onClick directo */}
            <button
              type="button"
              disabled={cargando}
              onClick={handleLoginSubmit}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0000ff', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {cargando ? 'Cargando...' : 'Ingresar'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <p style={{ fontSize: '13px', color: '#4a5568', margin: '0 0 10px 0' }}>
                ¿No tienes una cuenta? Crea una presionando aquí
              </p>
              <button
                type="button"
                onClick={() => cambiarModo('registro')}
                style={{ width: '100%', padding: '10px', backgroundColor: '#0000ff', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        ) : (
          // ... tu vista de registro se queda igual ...
          /* VISTA CREACIÓN DE CUENTA */
          <div>
            <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', color: '#1a202c', marginTop: 0, marginBottom: '25px', letterSpacing: '0.5px' }}>
              CREACION DE CUENTA
            </h1>

            <form onSubmit={handleRegistroSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '15px', color: '#2d3748', marginBottom: '6px' }}>
                  Ingrese su nombre:
                </label>
                <input
                  type="text"
                  required
                  value={nombreRegistro}
                  onChange={(e) => setNombreRegistro(e.target.value)}
                  placeholder="Enter name"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '15px', color: '#2d3748', marginBottom: '6px' }}>
                  Ingrese su email:
                </label>
                <input
                  type="email"
                  required
                  value={emailRegistro}
                  onChange={(e) => setEmailRegistro(e.target.value)}
                  placeholder="Enter email"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '15px', color: '#2d3748', marginBottom: '6px' }}>
                  Ingrese su password:
                </label>
                <input
                  type="password"
                  required
                  value={passwordRegistro}
                  onChange={(e) => setPasswordRegistro(e.target.value)}
                  placeholder="Enter password"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '15px', color: '#2d3748', marginBottom: '6px' }}>
                  Ingrese nuevamente su password:
                </label>
                <input
                  type="password"
                  required
                  value={passwordConfirmRegistro}
                  onChange={(e) => setPasswordConfirmRegistro(e.target.value)}
                  placeholder="Enter password"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0000ff', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginBottom: '12px' }}
              >
                {cargando ? 'Registrando...' : 'Crear Cuenta'}
              </button>

              <button
                type="button"
                onClick={() => cambiarModo('login')}
                style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                ← Volver al Login
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};