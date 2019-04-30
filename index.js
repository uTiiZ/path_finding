$(() => {
    draw_grid();

    $(document).keypress((e) => {
        if (e.keyCode == 13) {
            wait = false;
        }
    });

    $('.grid_item').on('mouseover', async (e) => {
        e.preventDefault();
        let node = new Node($(e.target).attr('x'), $(e.target).attr('y'), animation, size);
        if (e.ctrlKey) {
            $(e.target).addClass('wall')
            borders.push(node);
        } else if (e.altKey) {
            $(e.target).removeClass('wall')
            remove_borders(node)
        } else if ($('.start')[0] && !$(e.target).hasClass('start') && !animation) {
            $('#grid .row').children().removeClass('end')
            $('#grid .row').children().removeClass('path')
            $(e.target).addClass('end')
            await path_finding($('.start').attr('x'), $('.start').attr('y'), $('.end').attr('x'), $('.end').attr('y'));
        }
    });


    $('.grid_item').on('click', async (e) => {
        e.preventDefault();
        $('#grid .row .grid_item').children().text('')
        if (e.shiftKey) {
            $('#grid .row').children().removeClass('start')
            $('#grid .row').children().removeClass('end')
            $('#grid .row').children().removeClass('path')
            $('#grid .row').children().removeClass('possible')
            $('#grid .row').children().removeClass('active')
            $('#grid').removeClass('rainbow').removeClass('alert')
            $(e.target).toggleClass('start')
        } else if (e.ctrlKey) {
            let node = new Node($(e.target).attr('x'), $(e.target).attr('y'), animation, size);
            node.setHasBeenCrossed(false);
            if ($(e.target).hasClass('portal')) {
                remove_portals(node);
            } else {
                await add_portals(node);
            }
            $(e.target).toggleClass('portal')
        } else {
            $('#grid .row').children().removeClass('end')
            $('#grid .row').children().removeClass('path')
            $('#grid .row').children().removeClass('possible')
            $('#grid .row').children().removeClass('active')
            $('#grid').removeClass('rainbow').removeClass('alert')
            $(e.target).toggleClass('end')
            let date_begin = Date.now();
            await path_finding($('.start').attr('x'), $('.start').attr('y'), $('.end').attr('x'), $('.end').attr('y'));
            let date_end = Date.now();
            let time = date_end - date_begin;
            console.log(`Time - ${time}`)
        }
    });
});
const grid = 1000;
const item = 50;
const size = grid / item;
const diagonal_cost = parseInt((Math.sqrt(2 * (Math.pow(size, 2)))));
const diagonal = true;
const animation = true;
let nodes = [];
let closed = [];
let borders = [];
let path = [];
let portals = [];
let start = null;
let parent_node = null;
let end = null;
let no_path = false;
let complete = false;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const reset = () => {
    nodes = [];
    closed = [];
    path = [];
    start = null;
    parent_node = null;
    end = null;
    no_path = false;
    complete = false;
};

const path_finding = async (start_x, start_y, end_x, end_y) => {
    reset();
    start = new Node(start_x, start_y, animation, size);
    start.setG(0);
    closed.push(start);
    end = new Node(end_x, end_y, animation, size);
    parent_node = start;
    while (!complete && !no_path) {
        await loop(parent_node, animation)
        if (animation)
            await sleep(2)
    }
    if (animation && complete)
        $('#grid').addClass('rainbow');
};

const path_finding_no_animation = (start_x, start_y, end_x, end_y) => {
    reset();
    start = new Node(start_x, start_y, animation, size);
    start.setG(0);
    closed.push(start);
    end = new Node(end_x, end_y, animation, size);
    parent_node = start;
    while (!complete && !no_path) {
        loop(parent_node, false)
    }
    return path.length
};

const loop = (parent, animation) => {
    if (diagonal) {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (x == 1 && y == 1) { continue; }
                possible_x = (parent.getX() - size) + (x * size);
                possible_y = (parent.getY() - size) + (y * size);

                let cross_border_x = parent.getX() + (possible_x - parent.getX());
                let cross_border_y = parent.getY() + (possible_y - parent.getY());

                if (search_borders(cross_border_x, parent.getY()) != -1
                    || search_borders(parent.getX(), cross_border_y) != -1 && ((x == 0 | x == 2) && y != 1)) {
                    continue;
                }

                calculate_node_values(possible_x, possible_y, parent, animation);
            }
        }
    } else {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if ((x == 0 && y == 0) || (x == 2 && y == 0) ||
                    (x == 1 && y == 1) || (x == 0 && y == 2) ||
                    (x == 2 && y == 2)) {
                    continue;
                }
                possible_x = (parent.getX() - size) + (x * size);
                possible_y = (parent.getY() - size) + (y * size);
                calculate_node_values(possible_x, possible_y, parent, animation);
            }
        }
    }

    parent_node = lowest_f();

    if (parent_node == null) {
        no_path = true;
        return;
    }

    if (Node.isEqual(parent_node, end)) {
        // console.clear();
        connect_path(animation);
        // console.log(path.length);
        complete = true;
        return;
    }

    if (parent_node.isPortal()) {
        if (Node.isEqual(parent_node, portals[0])) {
            remove_all_nodes()
            calculate_node_values(portals[1].getX(), portals[1].getY(), parent_node.getParent(), animation);
        }
    }

    remove_node(parent_node);
    closed.push(parent_node);
    parent_node.setActive();

    if (diagonal) {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (x == 1 && y == 1) { continue; }
                possible_x = (parent_node.getX() - size) + (x * size);
                possible_y = (parent_node.getY() - size) + (y * size);
                let check = get_node(possible_x, possible_y);

                if (check != null) {
                    let distance_x = parent_node.getX() - check.getX();
                    let distance_y = parent_node.getY() - check.getY();
                    let new_g = parent_node.getG();

                    if (distance_x != 0 && distance_y != 0) {
                        new_g += diagonal_cost;
                    } else {
                        new_g += size;
                    }
                    if (new_g < check.getG()) {
                        let index = search_node(possible_x, possible_y);
                        if (index != -1) {
                            nodes[index].setParent(parent_node);
                            nodes[index].setG(new_g);
                            nodes[index].setF(nodes[index].getG() + nodes[index].getH());
                        }
                    }
                }
            }
        }
    }
}

const calculate_node_values = (possible_x, possible_y, parent, animation) => {
    if (possible_x < 0 || possible_y < 0 || possible_x >= item * size || possible_y >= item * size)
        return;


    if (search_closed(possible_x, possible_y) != -1 || search_node(possible_x, possible_y) != -1 || search_borders(possible_x, possible_y) != -1)
        return;

    node = new Node(possible_x, possible_y, animation, size);
    node.setPortal(search_portals(possible_x, possible_y) != -1);
    if (!Node.isEqual(node, end))
        node.setPossible();
    else
        node = end;
    node.setParent(parent);

    //Calculating G
    g_x = node.getX() - parent.getX();
    g_y = node.getY() - parent.getY();
    g = parent.getG();
        if (g_x != 0 && g_y != 0) {
            g += diagonal_cost;
        } else {
            g += size;
        }
    node.setG(g);

    //Calculating H
    if (portals.length > 0 && !portals[0].hasBeenCrossed()) {
        if (Math.abs(end.getX() - node.getX()) + Math.abs(end.getY() - node.getY()) <= Math.abs(portals[0].getX() - node.getX()) + Math.abs(portals[0].getY() - node.getY())) {
            h_x = Math.abs(end.getX() - node.getX());
            h_y = Math.abs(end.getY() - node.getY());
        } else {
            h_x = Math.abs(portals[0].getX() - node.getX());
            h_y = Math.abs(portals[0].getY() - node.getY());
            if (Node.isEqual(node, portals[0])) {
                portals[0].setHasBeenCrossed(true);
            }
        }
    } else {
        h_x = Math.abs(end.getX() - node.getX());
        h_y = Math.abs(end.getY() - node.getY());
    }
    h = h_x + h_y;
    node.setH(h);

    //Calculating F
    f = g + h;
    node.setF(f);

    nodes.push(node);
};

const connect_path = (animation) => {
    if (path.length == 0) {
        let p_node = end.getParent();

        while (!Node.isEqual(p_node, start)) {
            path.push(p_node);

            for (let i = 0; i < closed.length; i++) {
                let current = closed[i];

                if (Node.isEqual(current, p_node)) {
                    p_node = current.getParent();
                    break;
                }
            }
        }
        path.reverse()
        path.map((node) => {
            node.setPath();
        })
    }
};

const smalest = (a, b) => {
    return a < b ? a : b;
};

const lowest_f = () => {
    if (nodes.length > 0) {
        node_sort();
        return nodes[0];
    }
    return null;
};

const node_sort = () => {
    let map = nodes.map((node, index) => {
        return {
            index,
            node
        }
    });
    map.sort((a, b) => {
        return a.node.getF() - b.node.getF() || a.index - b.index;
    })
    nodes = map.map((e) => {
        return e.node
    });
};

const remove_all_nodes = () => {
    nodes = []
};

const remove_node = (node) => {
    _.remove(nodes, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
};

const get_node = (possible_x, possible_y) => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getX() == possible_x && nodes[i].getY() == possible_y) {
            return nodes[i];
        }
    }
    return null;
};

const search_node = (possible_x, possible_y) => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getX() == possible_x && nodes[i].getY() == possible_y) {
            return i;
        }
    }
    return -1;
};

const remove_closed = (node) => {
    _.remove(closed, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
};

const search_closed = (possible_x, possible_y) => {
    for (let i = 0; i < closed.length; i++) {
        if (closed[i].getX() == possible_x && closed[i].getY() == possible_y) {
            return i;
        }
    }
    return -1;
};

const remove_borders = (node) => {
    _.remove(borders, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
};

const search_borders = (possible_x, possible_y) => {
    for (let i = 0; i < borders.length; i++) {
        if (borders[i].getX() == possible_x && borders[i].getY() == possible_y) {
            return i;
        }
    }
    return -1;
};

const add_portals = (node) => {
    portals.push(node);
    portals_sort()
};

const portals_sort = () => {
    let map = portals.map((node, index) => {
        return {
            index,
            node
        }
    });
    map.sort((a, b) => {
        let a_length = path_finding_no_animation($('.start').attr('x'), $('.start').attr('y'), a.node.getX(), a.node.getY());
        let b_length = path_finding_no_animation($('.start').attr('x'), $('.start').attr('y'), b.node.getX(), b.node.getY());
        return a_length - b_length;
    })
    portals = map.map((e) => {
        return e.node
    });
};

const remove_portals = (node) => {
    _.remove(portals, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
};

const search_portals = (possible_x, possible_y) => {
    for (let i = 0; i < portals.length; i++) {
        if (portals[i].getX() == possible_x && portals[i].getY() == possible_y) {
            return i;
        }
    }
    return -1;
};

const draw_grid = () => {
    let g = $('#grid');
    g.css({
        width: grid,
        height: grid
    })
    for (let y = 0; y < item; y++) {
        let row = $('<div class="row"></div>');
        for (let x = 0; x < item; x++) {
            let grid_item = $('<span class="grid_item" style="width: ' + size + 'px; height: ' + size + 'px;"></span>');
            let span_g = $('<span class="g"></span>');
            let span_h = $('<span class="h"></span>');
            let span_f = $('<span class="f"></span>');
            grid_item.append(span_g).append(span_h).append(span_f);
            grid_item.attr('x', x * size);
            grid_item.attr('y', y * size);

            if (Math.random() >= 0.667) {
                let node = new Node(x * size, y * size, animation, size);
                grid_item.addClass('wall')
                borders.push(node);
            }

            row.append(grid_item);
        }
        g.append(row);
    }
};