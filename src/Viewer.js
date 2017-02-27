import React from 'react';
import Polyhedron from './Polyhedron';
import Sidebar from './Sidebar';
import X3dScene from './X3dScene';
import { polyhedra } from './data';
import _ from 'lodash';

const Viewer = ({ params }) => {
  const solidName = params.solid || 'tetrahedron';
  const solid = polyhedra[solidName];

  return (
    <div className="Viewer">
      <Sidebar />
      <X3dScene>
        <Polyhedron solid={solid}/>
      </X3dScene>
    </div>
  );
};

export default Viewer;
