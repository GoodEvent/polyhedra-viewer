// @flow strict
import _ from 'lodash';

import { hasMultiple, removeExtraneousVertices } from './operationUtils';
import { Polyhedron, Peak } from 'math/polyhedra';
import type { Operation } from './operationTypes';
import { getPeakAlignment, getCupolaGyrate } from './applyOptionUtils';

function removePeak(polyhedron, peak) {
  return removeExtraneousVertices(
    polyhedron.withChanges(solid =>
      solid.withoutFaces(peak.faces()).addFaces([peak.boundary().vertices]),
    ),
  );
}

interface DiminishOptions {
  peak: Peak;
}

export const diminish: Operation<DiminishOptions> = {
  apply(polyhedron, { peak }) {
    return removePeak(polyhedron, peak);
  },

  getSearchOptions(polyhedron, config, relations) {
    const options = {};
    const { peak } = config;
    if (!peak) {
      throw new Error('Invalid peak');
    }
    const vertices = peak.innerVertices();
    // If diminishing a pentagonal cupola/rotunda, check which one it is
    if (vertices.length === 5) {
      options.using = 'U5';
    } else if (vertices.length === 10) {
      options.using = 'R5';
    }

    if (hasMultiple(relations, 'gyrate')) {
      options.gyrate = getCupolaGyrate(polyhedron, peak);
    }

    if (options.gyrate !== 'ortho' && hasMultiple(relations, 'align')) {
      options.align = getPeakAlignment(polyhedron, peak);
    }
    return options;
  },

  getAllApplyArgs(polyhedron) {
    return Peak.getAll(polyhedron).map(peak => ({ peak }));
  },

  getApplyArgs(polyhedron, hitPnt) {
    const peak = Peak.find(polyhedron, hitPnt);
    return peak ? { peak } : {};
  },

  isHighlighted(polyhedron, applyArgs, face) {
    if (_.isObject(applyArgs.peak) && face.inSet(applyArgs.peak.faces())) {
      return true;
    }
  },
};

export function shorten(polyhedron: Polyhedron) {
  // Find a prism or antiprism face
  const faces = polyhedron.faces.filter(face => {
    return _.uniqBy(face.adjacentFaces(), 'numSides').length === 1;
  });
  const face = _.maxBy(faces, 'numSides');
  return removePeak(polyhedron, new Peak(polyhedron, face.vertices, 'prism'));
}
