class Node {

    constructor(x, y, boolean, size) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.boolean = boolean;
        this.size = size;
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

    isPortal() {
        return this.is_portal;
    }

    setX(x) {
        this.x = parseInt(x);
    }

    setY(y) {
        this.y = parseInt(y);
    }

    setG(g) {
        this.g = parseInt(g);
        (!this.boolean && size > 50) && this.getElement().find('span.g').text(g);
    }

    setH(h) {
        this.h = parseInt(h);
        (!this.boolean && size > 50)  && this.getElement().find('span.h').text(h);
    }

    setF(f) {
        this.f = parseInt(f);
        (!this.boolean && size > 50)  && this.getElement().find('span.f').text(f);
    }

    setParent(parent) {
        this.parent = parent;
    }

    setPortal(is_portal) {
        this.is_portal = is_portal;
    }

    getElement() {
        return $('.grid_item[x=' + this.x + '][y=' + this.y + ']');
    }

    setPossible() {
        !this.boolean && this.getElement().addClass('possible');
    }

    setActive() {
        !this.boolean && this.getElement().addClass('active').removeClass('possible');
    }

    setPath() {
        this.getElement().addClass('path').removeClass('active').removeClass('possible');
    }

    static isEqual(s, e) {
        if (s.getX() == e.getX() && s.getY() == e.getY()) {
            return true;
        }
        return false;
    }
}