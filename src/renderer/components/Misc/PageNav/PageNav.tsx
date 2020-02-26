import './PageNav.scss';
import React from 'react';

export type PageNavProps = {

}

export default function PageNav(props:PageNavProps){


    return (
        <div className="PageNav">
            <label >
                Page(s) : 
            </label>
            <button type="button" className="PageNav__button button button-frameless"  ><i className="fas fa-chevron-left"></i></button>
            <input type="text" className="PageNav__input input-field" />
            <button type="button" className="PageNav__button button button-frameless"  ><i className="fas fa-chevron-right"></i></button>
        </div>
    )
}