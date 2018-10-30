$(() => {
    draw_grid()
    $('.grid_item').on('mouseover', async (e) => {
        e.preventDefault();
        let node = new Node($(e.target).attr('x'), $(e.target).attr('y'), like_dofus, size);
        if (e.ctrlKey) {
            $(e.target).addClass('wall')
            borders.push(node);
        } else if (e.altKey) {
            $(e.target).removeClass('wall')
            remove_borders(node)
        } else if ($('.start')[0] && !$(e.target).hasClass('start') && like_dofus) {
            $('#grid .row').children().removeClass('end')
            $('#grid .row').children().removeClass('path')
            $(e.target).addClass('end')
            await path_finding();
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
            $(e.target).toggleClass('start')
        } else if (e.ctrlKey) {
            $(e.target).toggleClass('portal')
            let node = new Node($(e.target).attr('x'), $(e.target).attr('y'), like_dofus, size);
            portals.push(node)
        } else {
            $('#grid .row').children().removeClass('end')
            $('#grid .row').children().removeClass('path')
            $('#grid .row').children().removeClass('possible')
            $('#grid .row').children().removeClass('active')
            $(e.target).toggleClass('end')
            let date_begin = Date.now();
            await path_finding();
            let date_end = Date.now();
            let time = date_end - date_begin;
            console.log(`Time - ${time}`)
        }
    });
});
const grid = 650;
const item = 10;
const size = grid / item;
const like_dofus = false;
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

const path_finding = async () => {
    nodes = [];
    closed = [];
    path = [];
    start = null;
    parent_node = null;
    end = null;
    no_path = false;
    complete = false;

    start = new Node($('.start').attr('x'), $('.start').attr('y'), like_dofus, size);
    start.setG(0);
    closed.push(start);
    end = new Node($('.end').attr('x'), $('.end').attr('y'), like_dofus, size);
    parent_node = start;
    while (!complete && !no_path) {
        await loop(parent_node)
        if (!like_dofus)
            await sleep(25)
    }
};

const loop = async (parent) => {
    let node = null;
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            // if (x == 1 && y == 1) { continue; }
            if ((x == 0 && y == 0) || (x == 2 && y == 0) ||
                (x == 1 && y == 1) || (x == 0 && y == 2) ||
                (x == 2 && y == 2)) {
                continue;
            }
            possible_x = (parent.getX() - size) + (x * size);
            possible_y = (parent.getY() - size) + (y * size);
            calculate_node_values(possible_x, possible_y, node, parent);
        }
    }
    parent_node = lowest_f();
    if (parent_node == null) {
        console.log('End of path');
        no_path = true;
        return;
    }

    if (Node.isEqual(parent_node, end)) {
        console.log('Completed');
        connect_path();
        complete = true;
        return;
    }

    remove_node(parent_node);
    closed.push(parent_node);
    parent_node.setActive();
}

const calculate_node_values = (possible_x, possible_y, node, parent) => {
    if (possible_x < 0 || possible_y < 0 || possible_x >= item * size || possible_y >= item * size)
        return;


    if (search_closed(possible_x, possible_y) != -1 || search_node(possible_x, possible_y) != -1 || search_borders(possible_x, possible_y) != -1)
        return;

    node = new Node(possible_x, possible_y, like_dofus, size);
    node.setPortal(search_portals(possible_x, possible_y) != -1);
    if (!Node.isEqual(node, end))
        node.setPossible();
    else
        node = end
    node.setParent(parent);

    //Calculating G
    g_x = node.getX() - parent.getX();
    g_y = node.getY() - parent.getY();
    g = parent.getG() + size;
    node.setG(g);

    //Calculating H
    h_x = Math.abs(smalest(end.getX(), portals[0].getX()) - node.getX());
    h_y = Math.abs(smalest(end.getY(), portals[0].getY()) - node.getY());
    h = h_x + h_y;
    node.setH(h);

    //Calculating F
    f = g + h;
    node.setF(f);

    nodes.push(node)
};

const connect_path = () => {
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
        path.map(async (node) => {
            node.setPath();
        })
    }
};

const smalest = (a, b)  => {
    return a <= b ? a : b;
}

const lowest_f = () => {
    if (nodes.length > 0) {
        bubble_sort();
        return nodes[0];
    }
    return null;
};

const bubble_sort = () => {
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

const remove_node = (node) => {
    _.remove(nodes, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
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
            row.append(grid_item);
        }
        g.append(row);
    }
};