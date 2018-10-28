$(() => {
    draw_grid()
    $('.grid_item').on('click', (e) => {
        e.preventDefault();
        if (e.ctrlKey) {
            $(e.target).toggleClass('wall')
        } else {
            $(e.target).toggleClass('finish')
            path_finding();
        }
    });
})

const path_finding = () => {
    let start = $('.start');
    let finish = $('.finish');
    let node = start;
    let lowest_f_cost = null;
    let path_finded = false;
    while (!path_finded) {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x != 0 || y != 0) {
                    possible_x = parseInt(node.attr('x')) + x;
                    possible_y = parseInt(node.attr('y')) + y;
                    if (possible_x >= 0 && possible_y >= 0) {
                        let current = $('.grid_item[x=' + possible_x + '][y=' + possible_y + ']');
                        span_g_cost = $('<span class="g_cost"></span>');
                        span_h_cost = $('<span class="h_cost"></span>');
                        span_f_cost = $('<span class="f_cost"></span>');

                        g_cost = Math.abs(x) + Math.abs(y);
                        h_cost = Math.abs(parseInt(finish.attr('x')) - parseInt(current.attr('x'))) + Math.abs(parseInt(finish.attr('y')) - parseInt(current.attr('y')));
                        f_cost = g_cost + h_cost;

                        span_g_cost.text(g_cost);
                        span_h_cost.text(h_cost);
                        span_f_cost.text(f_cost);
                        current.attr('g_cost', g_cost).attr('h_cost', h_cost).attr('f_cost', f_cost);
                        current.append(span_g_cost).append(span_h_cost).append(span_f_cost);

                        if (lowest_f_cost == null || lowest_f_cost > f_cost) {
                            lowest_f_cost = f_cost;
                            node = current;
                            if (node.attr('x') == finish.attr('x') && node.attr('y') == finish.attr('y')) {
                                path_finded = true
                            } else {
                                node.addClass('active');
                            }
                        }
                    }
                }
            }
        }
    }
};

const draw_grid = () => {
    for (let i = 0; i < 10; i++) {
        let row = $('<div class="row"></div>');
        for (let j = 0; j < 10; j++) {
            let grid_item = $('<span class="grid_item"></span>');
            if (i == 4 && j == 6)
                grid_item.addClass('start');
            grid_item.attr('x', i);
            grid_item.attr('y', j);
            row.append(grid_item);
        }
        $('#grid').append(row);
    }
};