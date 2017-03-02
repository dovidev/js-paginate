var JSPaginate = {
    options : {
        per_pg        : 20
       ,qstr_pg_key   : 'pg'
       ,start_pg      : null // will default to ?pg={start_page}
       ,replace_state : true
       ,filterable    : false
       ,all_option    : false
    },
    init : function(options) {
        if (options) {
            JSPaginate.options = JSPaginate.mergeObjects(JSPaginate.options, options);
        }
        $('table.paginate').each(function(){
            var page_count = Math.ceil($(this).find('tbody tr').length / JSPaginate.options.per_pg);
            if (page_count > 1) {
                JSPaginate.buildPageNav($(this), page_count);   
                if (JSPaginate.options.filterable) {
                    JSPaginate.buildFilter($(this));
                }
                JSPaginate.markTags($(this));
                if (!JSPaginate.options.start_pg) {
                    JSPaginate.options.start_pg = JSPaginate.get(JSPaginate.options.qstr_pg_key);
                }
                JSPaginate.changePage(JSPaginate.options.start_pg || 1, $(this));
            }
            else {
                $(this).find('tbody tr').show();
            }
        });
    },
    buildPageNav : function(table, page_count) {
        var page_nav_id = $('table.paginate[page_nav]').length + 1;
        var page_nav = $('<div class="page_nav" data-page_nav="'+page_nav_id+'"></div>');
        
        var page_nav_first = $('<span class="first_pg"></span>');
        page_nav_first.click(JSPaginate.firstPage);
        page_nav.append(page_nav_first);
        
        var page_nav_prev = $('<span class="prev_pg"></span>');
        page_nav_prev.click(JSPaginate.prevPage);
        page_nav.append(page_nav_prev);
        
        for (var pg_no = 1; pg_no <= page_count; pg_no++) {
            var page_nav_pg = $('<span class="pg pg-'+pg_no+'" data-page="'+pg_no+'">'+pg_no+'</span>');
            page_nav_pg.click(JSPaginate.changePage);
            page_nav.append(page_nav_pg);
        }
        
        var page_nav_next = $('<span class="next_pg"></span>');
        page_nav_next.click(JSPaginate.nextPage);
        page_nav.append(page_nav_next);
        
        var page_nav_last = $('<span class="last_pg"></span>');
        page_nav_last.click(JSPaginate.lastPage);
        page_nav.append(page_nav_last);
        
        if (JSPaginate.options.all_option) {
            var page_nav_first = $('<span class="all_pg">All</span>');
            page_nav_first.click(JSPaginate.allPages);
            page_nav.append(page_nav_first);
        }
        
        table.data('page_nav', page_nav_id);
        table.attr('data-page_nav', page_nav_id);
        table.before(page_nav);
        table.after(page_nav.clone(true));
    },
    buildFilter : function(table, page_count) {
        var filter_row = $('<tr class="paginate_filter"></tr>');
        var exclude = JSPaginate.options.filter_exclude || [];
        table.addClass('filtered');
        table.find('thead tr:first-child th').each(function(){
            // TODO: implement exclude
            var th = $(this).clone();
            th.html('');
            var input = $('<input type="text" class="paginate_filter_input" />');
            input.on('keyup', JSPaginate.filter);
            th.append(input);
            filter_row.append(th);
        });
        table.find('thead').append(filter_row);
    },
    filter : function() {
        // console.log('filtering...');
        var table = $(this).closest('.paginate');
        var filtering = false;

        var matching_rows = table.find('tbody tr');
        matching_rows.hide();
        JSPaginate.getTablePageNav(table).css('visibility', 'hidden');
        table.find('tbody tr').hide();
        // table.find('tbody tr td:nth-child(' + index + ')').each(function(){
        table.find('.paginate_filter_input').each(function(){
            var search = $(this).val();
            var index = $(this).closest('th').index() + 1;            
            // console.log('index:', index);
            if (search) {
                filtering = true;
                for (var r = matching_rows.length - 1; r >= 0; r--) {
                    var tr = $(matching_rows[r]);
                    var td = tr.find('td:nth-child('+index+')');
                    // console.log(r, tr, td)
                    if (td.text().toLowerCase().search(search.toLowerCase()) < 0) {
                        // console.log(td.text() + ' is not a match for ' + search);
                        matching_rows.splice(r, 1);
                    }
                    else {
                        // console.log(td.text() + ' = ' + search);
                    }
                }
            }
        });
        if (filtering) {
            matching_rows.show();
        }
        else {        
            JSPaginate.changePage($('.page_nav').find('.active').data('page'), table);
        }
    },
    markTags : function(table) {
        var trs = table.find('tbody tr');
        for (var row_id = 0; row_id < trs.length; row_id++) {
            var tr = trs[row_id];
            var row_no = row_id + 1;
            var pg_no = Math.ceil(row_no / JSPaginate.options.per_pg);
            // console.log(row_no, pg_no);
            // console.log(tr, $(tr));
            $(tr).attr('data-page', pg_no);
            $(tr).data('page', pg_no);
        }
    },
    getPageNavTable : function(page_nav) {
        if (!page_nav.hasClass('page_nav')) {
            page_nav = page_nav.closest('.page_nav');
        }
        var page_nav_id = page_nav.data('page_nav');
        return $('table[data-page_nav='+page_nav_id+']');
    },
    getTablePageNav : function(table) {
        // console.log('getTablePageNav()');
        if (!table.hasClass('paginate')) {
            table = table.closest('.paginate');
        }
        var page_nav_id = table.data('page_nav');
        // console.log('page_nav_id:', page_nav_id);
        return $('.page_nav[data-page_nav='+page_nav_id+']');
    },
    allPages : function() {
        // console.log('nextPage()');
        var page_nav = $(this).closest('.page_nav');
        var table = JSPaginate.getPageNavTable($(this));
        page_nav = JSPaginate.getTablePageNav(table);
        table.find('tbody tr').show();
        page_nav.css('visibility', 'hidden');
    },
    nextPage : function() {
        if ($(this).hasClass('disabled')) return;
        // console.log('nextPage()');
        var curr_pg = $(this).closest('.page_nav').find('.pg.active').data('page');
        // console.log('curr_pg:', curr_pg);
        JSPaginate.changePage(curr_pg+1, JSPaginate.getPageNavTable($(this)));
    },
    prevPage : function() {
        if ($(this).hasClass('disabled')) return;
        var curr_pg = $(this).closest('.page_nav').find('.pg.active').data('page');
        JSPaginate.changePage(curr_pg-1, JSPaginate.getPageNavTable($(this)));
    },
    firstPage : function() {
        if ($(this).hasClass('disabled')) return;
        JSPaginate.changePage(1, JSPaginate.getPageNavTable($(this)));
    },
    lastPage : function() {
        if ($(this).hasClass('disabled')) return;
        var last_pg = $(this).closest('.page_nav').find('.pg').length;
        JSPaginate.changePage(last_pg, JSPaginate.getPageNavTable($(this)));
    },
    changePage : function(pg_no, table) {
        // console.log('changePage()');
        // console.log('pg_no:', pg_no);
        // console.log('table:', table);
        var page_nav;
        
        if (!table) {
            table = JSPaginate.getPageNavTable($(this));
        }
        page_nav = JSPaginate.getTablePageNav(table);
        // console.log('table:', table);
        // console.log('page_nav:', page_nav);
        if (!pg_no || pg_no.target) {
            pg_no = $(this).closest('[data-page]').data('page');
        }
        pg_no = parseInt(pg_no);
        if (isFinite(pg_no)) {
            page_nav.css('visibility', '');
            // console.log('pg_no:', pg_no);
            page_nav.find('span').removeClass('disabled');
            page_nav.find('span.pg').removeClass('active');
            page_nav.find('span.pg').removeClass('near');
            page_nav.find('span.pg[data-page="'+pg_no+'"]').addClass('active');
            
            if (JSPaginate.options.replace_state && !(!JSPaginate.get(JSPaginate.options.qstr_pg_key) && pg_no == 1)) {
                // change url and state to match current view
                var get = JSPaginate.get();
                get[JSPaginate.options.qstr_pg_key] = pg_no;
                full_url = location.toString().split('?')[0] + JSPaginate.toQStr(get);
                history.replaceState(null, null, full_url);
            }
            var near_pgs = 6;
            var page_count = $(page_nav[0]).find('.pg').length;
            var max_near_page = pg_no + (near_pgs / 2);
            var min_near_page = pg_no - (near_pgs / 2);
            // console.log('page_count:', page_count);
            // console.log('page_count:', page_count);
            // console.log('max_near_page:', max_near_page);
            // console.log('min_near_page:', min_near_page);
            if (min_near_page <= 0) {
                max_near_page -= min_near_page - 1;
                min_near_page = 0;
            }
            if (max_near_page > page_count) {
                min_near_page -= max_near_page - page_count;
                max_near_page = page_count;
            }
            // console.log('max_near_page:', max_near_page);
            // console.log('min_near_page:', min_near_page);
            for (var near_pg_no = min_near_page; near_pg_no <= max_near_page; near_pg_no++) {
                if (near_pg_no != pg_no) {
                    page_nav.find('span.pg[data-page="'+near_pg_no+'"]').addClass('near');
                }
            }
            
            if (pg_no == 1) {
                page_nav.find('.prev_pg,.first_pg').addClass('disabled');
            }
            else if (pg_no == page_count) {
                page_nav.find('.next_pg,.last_pg').addClass('disabled');
            }
            
            table.find('tbody tr').hide();
            table.find('tbody tr[data-page="'+pg_no+'"]').show();
        }
    },
    toQStr : function(arr) {
        var qstr = '?';
        for (var k in arr) {
            var v = arr[k];
            qstr += k + '=' + v + '&';
        }
        return qstr.slice(0,-1);
    },
    get : function(key) {
        var get = {};
        var qstr = location.toString().split('?')[1];
        if (qstr) {
            get_kv = qstr.split('&');        
            for (var i = 0; i < get_kv.length; i++) {
                var k = get_kv[i].split('=')[0];
                var v = get_kv[i].split('=')[1];
                get[k] = v;
            }
        }
        if (key) { 
            return get[key];
        }
        else {
            return get;
        }
    },
    mergeObjects : function(ob1, ob2) {
    for (var i in ob2) {
        if (ob1[i] && typeof ob2[i] === 'object') {
            mergeObjects(ob1[i], ob2[i]);
        }
        else {
            ob1[i] = ob2[i];
        }
    }
    return ob1;
}
}
