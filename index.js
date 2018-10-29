$(() => {
    draw_grid()
    $('.grid_item').on('mouseover', (e) => {
        e.preventDefault();
        if (e.ctrlKey) {
            $(e.target).addClass('wall')
        }
        if (e.altKey) {
            $(e.target).removeClass('wall')
        }
    });


    $('.grid_item').on('click', (e) => {
        e.preventDefault();
        if (e.shiftKey) {
            $(e.target).addClass('start')
        } else {
            $(e.target).toggleClass('end')
        }
        nodes = [];
        path_finding();
    });
});

const grid_size = 10;
const size = 65;
let nodes = [];
let closed = [];
let start = null;
let parent_node = null;
let end = null;
let no_path = false;
let complete = false;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const path_finding = async () => {
    start = new Node($('.start').attr('x'), $('.start').attr('y'));
    start.setG(0);
    closed.push(start);
    end = new Node($('.end').attr('x'), $('.end').attr('y'));
    parent_node = start;
    while (!complete) {
        await loop(parent_node)
        await sleep(500);
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
        complete = true;
        return;
    }
    remove_node(parent_node);
    closed.push(parent_node);
    parent_node.setActive();
}

const calculate_node_values = (possible_x, possible_y, node, parent) => {
    if (possible_x < 0 || possible_y < 0 || possible_x >= grid_size * size || possible_y >= grid_size * size)
        return;

    if (search_closed(possible_x, possible_y) != -1 || search_node(possible_x, possible_y) != -1)
        return;

    node = new Node(possible_x, possible_y);
    node.setParent(parent);
    if (!Node.isEqual(node, end))
        node.setPossible();

    //Calculating G
    g_x = node.getX() - parent.getX();
    g_y = node.getY() - parent.getY();
    g = parent.getG() + size;
    node.setG(g);

    //Calculating H
    h_x = Math.abs(end.getX() - node.getX());
    h_y = Math.abs(end.getY() - node.getY());
    h = h_x + h_y;
    node.setH(h);

    //Calculating F
    f = g + h;
    node.setF(f);

    nodes.push(node)
};

const lowest_f = () => {
    if (nodes.length > 0) {
        /* return nodes.sort((a, b) => { return a.getF() - b.getF() })[0]; */
        bubble_sort(nodes);
        return nodes[0];
    }
    return null;
};

const remove_node = (node) => {
    _.remove(nodes, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
}

const search_node = (possible_x, possible_y) => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getX() == possible_x && nodes[i].getY() == possible_y) {
            return i;
        }
    }
    return -1;
}

const remove_closed = (node) => {
    _.remove(closed, (n) => {
        return n.getX() == node.getX() && n.getY() == node.getY();
    });
}

const search_closed = (possible_x, possible_y) => {
    for (let i = 0; i < closed.length; i++) {
        if (closed[i].getX() == possible_x && closed[i].getY() == possible_y) {
            return i;
        }
    }
    return -1;
}

const bubble_sort = (array) => {
    let sw = -1;
    let temp = new Node();

    while (sw != 0) {
        sw = 0;
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i].getF() < array[i + 1].getF()) {
                temp = array[i];
                array.splice(array[i])
                array.splice(i + 1, 0, temp)
                sw = 1;
            }
        }
    }
}

const draw_grid = () => {
    for (let y = 0; y < grid_size; y++) {
        let row = $('<div class="row"></div>');
        for (let x = 0; x < grid_size; x++) {
            let grid_item = $('<span class="grid_item"></span>');
            let span_g = $('<span class="g"></span>');
            let span_h = $('<span class="h"></span>');
            let span_f = $('<span class="f"></span>');
            grid_item.append(span_g).append(span_h).append(span_f);
            if (x == 1 && y == 4)
                grid_item.addClass('start');
            /* if ((x == 4 && y == 1) || (x == 4 && y == 2) || (x == 4 && y == 3) || (x == 4 && y == 4) || (x == 4 && y == 5) || (x == 4 && y == 6))
                grid_item.addClass('wall'); */
            grid_item.attr('x', x * size);
            grid_item.attr('y', y * size);
            row.append(grid_item);
        }
        $('#grid').append(row);
    }
};