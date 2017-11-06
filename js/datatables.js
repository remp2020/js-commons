$.fn.dataTables = {
    pagination: function (settings) {
        var start = settings._iDisplayStart;
        var length = settings._iDisplayLength;
        var count = settings._iRecordsDisplay;

        $('.ah-pagination button').removeAttr('disabled');

        if (start == 0) {
            $('.ah-prev button').attr('disabled', 'disabled');
        }

        if (start + length >= count) {
            $('.ah-next button').attr('disabled', 'disabled');
        }
    },

    navigation: function (dataTable) {
        $('.ah-search input').on('keyup', function () {
            dataTable.search($(this).val()).draw();
        });

        $('.ah-length li').on('click', function () {
            var value = $(this).data('value');

            $('.ah-length button').html($(this).find('a').text());
            $('.ah-length li').removeClass('active');
            $(this).addClass('active');

            dataTable.page.len(value).draw();
        });

        $('.ah-prev').on('click', function () {
            dataTable.page('previous').draw('page');
        });

        $('.ah-next').on('click', function () {
            dataTable.page('next').draw('page');
        });
    },

    render: {
        date: function () {
            return function(data) {
                var date = new Date(data);
                return date.toLocaleString();
            }
        },
        number: function () {
            return function(data) {
                return data.toLocaleString();
            }
        },
        boolean: function () {
            return function(data) {
                if (data === 1 || data === true) {
                    return 'Yes';
                }
                if (data === 0 || data === false) {
                    return 'No';
                }
                console.warn("remp datatables: invalid value passed to boolean renderer: " + data);
                return '';
            }
        },
        link: function () {
            return function(data) {
                return '<a href="' + data.url + '">' + data.text + '</a>';
            }

        },
        bytes: function () {
            return function (data) {
                if (data === null) {
                    return '';
                }

                var k = 1024;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var i = Math.floor(Math.log(data) / Math.log(k));

                return parseFloat((data / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };
        },
        array: function (config) {
            var column = config["column"];
            return function(data) {
                var result = '';
                for (var i=0; i<data.length; i++) {
                    result += data[i][column] + '<br/>';
                }
                return result;
            }
        },
        badge: function () {
            return function(data) {
                var string = '';
                $.each(data, function (index, badge) {
                    if (badge !== '') {
                        string += '<div class="badge m-r-5 ' + badge.class + '">' + badge.text + '</div>';
                    }
                });

                return string;
            }
        },
        actions: function (actionSettings) {
            return function(data, type, row) {
                var actions = '<span class="actions">';
                $.each(actionSettings, function (key, action) {
                    if (row.actions[action['name']] === null) {
                        actions += '<a class="btn btn-sm palette-Cyan bg waves-effect" disabled="disabled" href=""><i class="zmdi ' + action['class'] + '"></i></a>\n';
                        return;
                    }
                    if (row.action_methods && row.action_methods[action['name']]) {
                        var tokenVal = $('meta[name="csrf-token"]').attr('content');
                        actions += '<form method="POST" action="' + row.actions[action['name']] + '">';
                        actions += '<button type="submit" class="btn btn-sm palette-Cyan bg waves-effect"><i class="zmdi ' + action['class'] + '"></i></button>\n';
                        actions += '<input type="hidden" name="_token" value="' + tokenVal + '" />\n';
                        actions += '<input type="hidden" name="_method" value="' + row.action_methods[action['name']] + '" />\n';
                        actions += '</form>';
                        return;
                    }
                    actions += '<a class="btn btn-sm palette-Cyan bg waves-effect" href="' + row.actions[action['name']] + '"><i class="zmdi ' + action['class'] + '"></i></a>\n';
                });
                actions += '</span>';
                return actions;
            }
        }
    }
};