class Node {

    constructor(x, y) {
        this.x = parseInt(x);
        this.y = parseInt(y);
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getG() {
        return this.g;
    }

    getH() {
        return this.h;
    }

    getF() {
        return this.f;
    }

    getNode() {
        return this;
    }

    getParent() {
        return this.parent;
    }

    setX(x) {
        this.x = parseInt(x);
    }

    setY(y) {
        this.y = parseInt(y);
    }

    setG(g) {
        this.g = parseInt(g);
        this.getElement().find('span.g').text(g / 65);
    }

    setH(h) {
        this.h = parseInt(h);
        this.getElement().find('span.h').text(h / 65);
    }

    setF(f) {
        this.f = parseInt(f);
        this.getElement().find('span.f').text(f / 65);
    }

    setParent(parent) {
        this.parent = parent;
    }

    getElement() {
        return $('.grid_item[x=' + this.x + '][y=' + this.y + ']');
    }

    setPossible() {
        this.getElement().addClass('possible');
    }

    setActive() {
        this.getElement().addClass('active').removeClass('possible');
    }

    static isEqual(s, e) {
        if (s.getX() == e.getX() && s.getY() == e.getY()) {
            return true;
        }
        return false;
    }
}