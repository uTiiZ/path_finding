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
            $(e.target).toggleClass('finish')
        }
        nodes = [];
        path_finding();
    });
});

const size = 10;
let nodes = [];

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const path_finding = async () => {
    let start = $('.start');
    let finish = $('.finish');
    let node = start;
    let path_finded = false;
    let path = null;
    while (!path_finded) {
        await loop(node, path_finded, start, finish)
        node = lowest_f(finish)
        if (node !== null) {
            path_finded = node.attr('x') == finish.attr('x') && node.attr('y') == finish.attr('y');
            path = '';
        } else {
            path_finded = true; 
            path = null;           
        }
        await sleep(50);
    }
    if (path == null) {
        console.log('Path not found');
    }
};

const loop = async (node, path_finded, start, finish) => {
    for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
            if ((x != 0 || y != 0) && (Math.abs(x) + Math.abs(y) != 2)) {
                possible_x = parseInt(node.attr('x')) + x;
                possible_y = parseInt(node.attr('y')) + y;
                if ((possible_x >= 0 && possible_y >= 0) && (0 <= possible_x && possible_x < size && 0 <= possible_y && possible_y < size)) {
                    let current = $('.grid_item[x=' + possible_x + '][y=' + possible_y + ']');
                    if ((current.attr('x') != start.attr('x') || current.attr('y') != start.attr('y')) &&
                        !current.hasClass('active') && !current.hasClass('wall')) {
                        g_cost = Math.abs(parseInt(current.attr('x')) - parseInt(start.attr('x'))) + Math.abs(parseInt(current.attr('y')) - parseInt(start.attr('y')));
                        h_cost = Math.abs(parseInt(finish.attr('x')) - parseInt(current.attr('x'))) + Math.abs(parseInt(finish.attr('y')) - parseInt(current.attr('y')));
                        f_cost = g_cost + h_cost;

                        let span_g_cost = null;
                        let span_h_cost = null;
                        let span_f_cost = null;
                        if (current.find('span.g_cost').length === 0 &&
                            current.find('span.h_cost').length === 0 &&
                            current.find('span.f_cost').length === 0) {
                            span_g_cost = $('<span class="g_cost"></span>');
                            span_h_cost = $('<span class="h_cost"></span>');
                            span_f_cost = $('<span class="f_cost"></span>');
                            current.append(span_g_cost).append(span_h_cost).append(span_f_cost);
                        } else {
                            span_g_cost = current.find('span.g_cost');
                            span_h_cost = current.find('span.h_cost');
                            span_f_cost = current.find('span.f_cost');
                        }

                        if (!(current.attr('x') == finish.attr('x') && current.attr('y') == finish.attr('y'))) {
                            span_g_cost.text(g_cost * 64);
                            span_h_cost.text(h_cost * 64);
                            span_f_cost.text(f_cost * 64);
                        }

                        current.attr('g', g_cost).attr('h', h_cost).attr('f', f_cost);
                        if (!_.some(nodes, current))
                            nodes.push(current)
                        if (h_cost != 0) {
                            current.addClass('possible');
                        }
                    }
                }
            }
        }
    }
    return path_finded;
}

const lowest_f = (finish) => {
    nodes = nodes.sort((a, b) => { return a.attr('f') - b.attr('f') });
    let node = nodes[0];
    if (typeof node !== typeof undefined) {
        if (!(node.attr('x') == finish.attr('x') && node.attr('y') == finish.attr('y'))) {
            node.addClass('active').removeClass('possible')
        }
        _.remove(nodes, (current) => {
            return current.attr('x') == node.attr('x') && current.attr('y') == node.attr('y');
        });
        return node;
    } else {
        return null
    }
};

const draw_grid = () => {
    for (let y = 0; y < 10; y++) {
        let row = $('<div class="row"></div>');
        for (let x = 0; x < 10; x++) {
            let grid_item = $('<span class="grid_item"></span>');
            if (x == 1 && y == 4)
                grid_item.addClass('start');
            if ((x == 4 && y == 1) || (x == 4 && y == 2) || (x == 4 && y == 3) || (x == 4 && y == 4) || (x == 4 && y == 5) || (x == 4 && y == 6))
                grid_item.addClass('wall');
            grid_item.attr('x', x);
            grid_item.attr('y', y);
            row.append(grid_item);
        }
        $('#grid').append(row);
    }
};