import React from "react";
import {LabelForm} from "./styleContent"; // Asegúrate de que la ruta es correcta

const RequiredLabel = ({children}) => (
    <LabelForm>
        {children} <span style={{color: 'red', paddingLeft: '5px'}}>*</span>
    </LabelForm>
);

export default RequiredLabel;
