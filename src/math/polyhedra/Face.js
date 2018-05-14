// @flow
import _ from 'lodash';
import { Vec3D } from 'toxiclibsjs/geom';

import { replace, getCyclic } from 'util.js';
import Polyhedron from './Polyhedron';
import { VIndex, FIndex } from './solidTypes';
import Edge from './Edge';
import Vertex from './Vertex';
import {
  PRECISION,
  getPlane,
  getCentroid,
  getNormal,
  getNormalRay,
} from 'math/linAlg';

export default class Face {
  polyhedron: Polyhedron;
  fIndex: FIndex;
  face: VIndex[];
  vertices: Vertex[];
  vectors: $ReadOnly<Vec3D>[];

  constructor(polyhedron: Polyhedron, fIndex: FIndex) {
    this.polyhedron = polyhedron;
    this.fIndex = fIndex;
    this.face = polyhedron.faces[fIndex];
    this.vertices = _.map(this.face, vIndex => polyhedron.vertexObjs[vIndex]);
    this.vectors = _.map(this.vertices, 'vec');
  }

  get numSides() {
    return this.face.length;
  }

  vIndices() {
    return this.face;
  }

  nextVertex(v: Vertex) {
    return getCyclic(this.vertices, this.face.indexOf(v.index) + 1);
  }

  prevVertex(v: Vertex) {
    return getCyclic(this.vertices, this.face.indexOf(v.index) - 1);
  }

  // FIXME get rid
  replaceVertex(vIndex: VIndex, ...vIndices: VIndex[]) {
    return replace(this.face, this.face.indexOf(vIndex), ...vIndices);
  }

  edge(i: number) {
    const vIndex = getCyclic(this.face, i);
    return new Edge(this.polyhedron, vIndex, getCyclic(this.face, i + 1));
  }

  edges() {
    return _.map(this.face, (vIndex, i) => this.edge(i));
  }

  numUniqueSides() {
    return _.countBy(this.edges(), edge => edge.length() > PRECISION);
  }

  // Return true if this face is the same as the given face (within a polyhedron)
  equals(other: Face) {
    return this.fIndex === other.fIndex;
    // return this.polyhedron === other.polyhedron && this.fIndex === other.fIndex;
  }

  inSet(faces: Face[]) {
    return _.some(faces, face => this.equals(face));
  }

  indexIn(faces: Face[]) {
    return _.findIndex(faces, face => this.equals(face));
  }

  /** Return the set of faces connected by an edge */
  adjacentFaces() {
    return this.polyhedron.faceGraph()[this.fIndex];
  }

  /** Return the set of faces that share a vertex to this face (including itself) */
  vertexAdjacentFaces() {
    return _(this.vertices)
      .flatMap(vertex => vertex.adjacentFaces())
      .uniqBy('fIndex')
      .value();
  }

  directedAdjacentFaces() {
    return _.map(this.edges(), edge => edge.adjacentFaces()[1]);
  }

  edgeLength() {
    return this.edge(0).length();
  }

  plane() {
    return getPlane(this.vectors);
  }

  apothem() {
    return this.edgeLength() / (2 * Math.tan(Math.PI / this.numSides));
  }

  /** Return the centroid of the face given by the face index */
  centroid() {
    return getCentroid(this.vectors);
  }

  distanceToCenter() {
    const origin = this.polyhedron.centroid();
    return origin.distanceTo(this.centroid());
  }

  /** Return the normal of the face given by the face index */
  normal() {
    return getNormal(this.vectors);
  }

  normalRay() {
    return getNormalRay(this.vectors);
  }

  isValid() {
    return _.every(this.edges(), edge => edge.length() > PRECISION);
  }

  withPolyhedron(polyhedron: Polyhedron) {
    return new Face(polyhedron, this.fIndex);
  }
}