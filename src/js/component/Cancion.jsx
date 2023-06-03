import React from "react";

const Cancion = ({ numero, name, url, funcion }) => {
    return (
        <div className="row border border-dark p-2 d-flex listaCancion" src={url} onClick={funcion}>
            <div className="col-1">
                {numero}
            </div>
            <div className="col-10">
                {name}
            </div>
        </div>
    );
}

export default Cancion;