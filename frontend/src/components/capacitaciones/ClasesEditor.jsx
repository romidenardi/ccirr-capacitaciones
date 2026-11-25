import { claseVacia, duplicarClase, usaLink, usaLugar } from '../../utils/capacitacionForm.js';
import { formatearFecha } from '../../utils/formato.js';
import './ClasesEditor.css';

// Lista editable de las clases de una capacitación. Recibe las clases y avisa cada cambio con onChange.
function ClasesEditor({ clases, onChange }) {
  const cambiarCampo = (indice, campo, valor) => {
    onChange(clases.map((clase, i) => (i === indice ? { ...clase, [campo]: valor } : clase)));
  };

  const agregar = () => onChange([...clases, claseVacia()]);

  // La copia queda justo después de la original
  const duplicar = (indice) => {
    const copia = duplicarClase(clases[indice]);
    onChange([...clases.slice(0, indice + 1), copia, ...clases.slice(indice + 1)]);
  };

  const quitar = (indice) => onChange(clases.filter((_, i) => i !== indice));

  return (
    <div className="clases">
      <ol className="clases__lista">
        {clases.map((clase, indice) => {
          const id = (campo) => `${clase._clave}-${campo}`;
          const cambiar = (event) => cambiarCampo(indice, event.target.name, event.target.value);

          return (
            <li key={clase._clave} className="clase">
              <div className="clase__encabezado">
                <h3 className="clase__titulo">
                  Clase {indice + 1}
                  {clase.fecha && <span className="clase__fecha"> {formatearFecha(clase.fecha)}</span>}
                </h3>
                <div className="clase__acciones">
                  <button type="button" className="clase__accion" onClick={() => duplicar(indice)}>
                    Duplicar
                  </button>
                  {clases.length > 1 && (
                    <button
                      type="button"
                      className="clase__accion clase__accion--quitar"
                      onClick={() => quitar(indice)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>

              <div className="clase__campos">
                <div className="campo">
                  <label className="campo__etiqueta" htmlFor={id('fecha')}>
                    Fecha
                  </label>
                  <input id={id('fecha')} type="date" name="fecha" value={clase.fecha} onChange={cambiar} required />
                </div>

                <div className="campo">
                  <label className="campo__etiqueta" htmlFor={id('horaInicio')}>
                    Desde
                  </label>
                  <input
                    id={id('horaInicio')}
                    type="time"
                    name="horaInicio"
                    value={clase.horaInicio}
                    onChange={cambiar}
                    required
                  />
                </div>

                <div className="campo">
                  <label className="campo__etiqueta" htmlFor={id('horaFin')}>
                    Hasta
                  </label>
                  <input id={id('horaFin')} type="time" name="horaFin" value={clase.horaFin} onChange={cambiar} />
                </div>

                <div className="campo">
                  <label className="campo__etiqueta" htmlFor={id('modalidad')}>
                    Modalidad
                  </label>
                  <select id={id('modalidad')} name="modalidad" value={clase.modalidad} onChange={cambiar}>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>

                {usaLugar(clase.modalidad) && (
                  <div className="campo clase__ancho">
                    <label className="campo__etiqueta" htmlFor={id('lugar')}>
                      Lugar
                    </label>
                    <input id={id('lugar')} name="lugar" value={clase.lugar} onChange={cambiar} maxLength={200} />
                  </div>
                )}

                {usaLink(clase.modalidad) && (
                  <div className="campo clase__ancho">
                    <label className="campo__etiqueta" htmlFor={id('linkVirtual')}>
                      Link de acceso virtual
                    </label>
                    <input
                      id={id('linkVirtual')}
                      type="url"
                      name="linkVirtual"
                      value={clase.linkVirtual}
                      onChange={cambiar}
                      placeholder="https://"
                    />
                  </div>
                )}

                <div className="campo clase__mitad">
                  <label className="campo__etiqueta" htmlFor={id('tema')}>
                    Tema de esta clase (opcional)
                  </label>
                  <input id={id('tema')} name="tema" value={clase.tema} onChange={cambiar} maxLength={200} />
                </div>

                <div className="campo clase__mitad">
                  <label className="campo__etiqueta" htmlFor={id('disertante')}>
                    Disertante de esta clase (opcional)
                  </label>
                  <input
                    id={id('disertante')}
                    name="disertante"
                    value={clase.disertante}
                    onChange={cambiar}
                    maxLength={200}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <button type="button" className="boton boton--secundario" onClick={agregar}>
        Agregar clase
      </button>
      <p className="campo__ayuda">
        «Duplicar» copia la clase una semana después, con el mismo horario y lugar. Al guardar, las clases se ordenan
        por fecha.
      </p>
    </div>
  );
}

export default ClasesEditor;
