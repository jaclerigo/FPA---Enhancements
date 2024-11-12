// ==UserScript==
// @name         FPA - Enhancements: Datepicker, Zoom, Increased Records, DataTables with Footer Adjustment
// @namespace    https://si.fpa.pt/
// @version      1.5
// @description  Aplica Datepicker, zoom, aumenta registos por página, ajusta rodapé e transforma tabelas em DataTables com ordenação por data e depuração
// @author       João Clérigo
// @match        https://si.fpa.pt/*
// @icon         https://si.fpa.pt/favicon.ico
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js

// @require      https://cdn.datatables.net/2.1.8/js/dataTables.min.js
// @require      https://cdn.datatables.net/buttons/3.1.2/js/dataTables.buttons.min.js
// @require      https://cdn.datatables.net/buttons/3.1.2/js/buttons.colVis.min.js
// @require      https://cdn.datatables.net/buttons/3.1.2/js/buttons.html5.min.js
// @require      https://cdn.datatables.net/buttons/3.1.2/js/buttons.print.min.js
// @require      https://cdn.datatables.net/plug-ins/2.1.8/sorting/datetime-moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js

// @require      https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js

// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    var $ = window.jQuery;
    $.noConflict();

    // Injetar o CSS do jQuery UI
    var jQueryUIcss = document.createElement("link");
    jQueryUIcss.href = "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css";
    jQueryUIcss.rel = "stylesheet";
    document.head.appendChild(jQueryUIcss);

    // Injetar o CSS do DataTables
    var dataTablesCSS = document.createElement("link");
    dataTablesCSS.href = "https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css";
    dataTablesCSS.rel = "stylesheet";
    document.head.appendChild(dataTablesCSS);

    // Injetar o CSS do DataTables
    var buttonsCSS = document.createElement("link");
    buttonsCSS.href = "https://cdn.datatables.net/buttons/3.1.2/css/buttons.dataTables.min.css";
    buttonsCSS.rel = "stylesheet";
    document.head.appendChild(buttonsCSS);

    // Aplica um zoom de 125% à página
    $("body").css("zoom", "125%");

    // Definição manual da regionalização para Português no Datepicker
    $.datepicker.regional['pt'] = {
        closeText: 'Fechar',
        prevText: '&#x3C;Anterior',
        nextText: 'Próximo&#x3E;',
        currentText: 'Hoje',
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun',
            'Jul','Ago','Set','Out','Nov','Dez'],
        dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        dayNamesMin: ['D','S','T','Q','Q','S','S'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['pt']);

    // Função para inicializar os Datepickers
    function initializeDatepickers() {
        $("input[name='P_QFDI_JOG_DATA'], input[name='P_QFDS_JOG_DATA']").each(function() {
            if (!$(this).hasClass('hasDatepicker')) { // Evita reaplicar o Datepicker
                $(this).datepicker({
                    dateFormat: "dd/mm/yy",
                    changeMonth: true,
                    changeYear: true,
                    yearRange: "1900:2100"
                }).attr('autocomplete', 'off');
            }
        });
    }

    // Registrar o formato de data para DataTables
    if (typeof $.fn.dataTable.moment === 'function') {
        $.fn.dataTable.moment('DD/MM/YYYY HH:mm'); // Corrigido para corresponder ao formato das suas datas
        console.log('Moment.js format registrado para DataTables: DD/MM/YYYY HH:mm');
    } else {
        console.error('DataTables Moment plugin não está disponível.');
    }

    // Função para inicializar DataTables na tabela específica
    function initializeDataTables() {
        // Seleciona a tabela dentro do DIV com ID 'lista_part_work'
        var table = $('#lista_part_work').find('table.tabela');

        // Verifica se a tabela existe e ainda não foi inicializada como DataTable
        if (table.length && !$.fn.DataTable.isDataTable(table)) {
            // Ajustar a estrutura da tabela para incluir <thead> se não existir
            if (table.find('thead').length === 0) {
                var firstRow = table.find('tr').first();
                var thead = $('<thead></thead>');
                thead.append(firstRow.clone());
                table.prepend(thead);
                firstRow.remove(); // Remover a primeira linha do tbody
            }

            // Verificar se o número de colunas no thead e tbody coincide
            var thCount = table.find('thead th').length;
            var tbodyRows = table.find('tbody tr');
            var discrepancyFound = false;

            tbodyRows.each(function(index, tr) {
                var tdCount = $(tr).find('td').length;
                if (tdCount !== thCount) {
                    console.warn('DataTables: O número de <td> na linha ' + (index + 1) + ' é ' + tdCount + ', esperado ' + thCount + '.');
                    // Destacar a linha problemática visualmente
                    // $(tr).css('background-color', '#ffcccc'); // Vermelho claro
                    discrepancyFound = true;
                }
            });

            if (!discrepancyFound) {
                // Inicializa o DataTable
                table.DataTable({
					"dom": 'Bfrt<"clearfix">ip',
                    "pageLength": 100, // Define o número de registos por página
                    "order": [[5, "asc"]], // Ordena pela 6ª coluna (Data / Hora) em ordem ascendente
                    "columnDefs": [
                        { "type": "datetime-moment", "targets": 5 } // Define o tipo da coluna para melhor ordenação
                    ],
                    "language": {
                        "sEmptyTable": "Nenhum registro encontrado",
                        "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                        "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
                        "sInfoFiltered": "(Filtrados de _MAX_ registros)",
                        "sInfoPostFix": "",
                        "sInfoThousands": ".",
                        "sLengthMenu": "Mostrar _MENU_ resultados por página",
                        "sLoadingRecords": "Carregando...",
                        "sProcessing": "Processando...",
                        "sZeroRecords": "Nenhum registro encontrado",
                        "sSearch": "Pesquisar",
                        "oPaginate": {
                            "sNext": "Próximo",
                            "sPrevious": "Anterior",
                            "sFirst": "Primeiro",
                            "sLast": "Último"
                        },
                        "oAria": {
                            "sSortAscending": ": Ordenar colunas de forma ascendente",
                            "sSortDescending": ": Ordenar colunas de forma descendente"
                        }
                    },
                    "autoWidth": false,
                    "buttons": [
                        {extend: 'copy', text: 'Copy', titleAttr: 'Copiar', key: {key: 'c', altKey: true}},
                        {extend: 'excel', text: 'XLXS', titleAttr: 'Excel', key: {key: 'x', altKey: true}, createEmptyCells: true},
                        {extend: 'csv', text: 'CSV', titleAttr: 'CSV', key: {key: 's', altKey: true}},
                        {extend: 'print', text: 'PRINT', titleAttr: 'Impressão', key: {key: 'r', altKey: true}},
                    ],
                    "initComplete": function(settings, json) {
                        // Aplicar os estilos após a inicialização do DataTable

                        $(".dt-buttons, .dt-search").css('display', 'inline');

                            var css = '.dt-search { float: right !important; } .dt-input {font-size: 14px; }';
                            var style = $('<style>').prop('type', 'text/css').html(css);
                            $('head').append(style);

                    }

                });
                console.log('DataTables inicializado com sucesso.');
            } else {
                console.warn('DataTables não foi inicializado devido a discrepâncias nas colunas.');
            }

        }
    }

    // Função para mover o último <tr> para uma nova tabela fora de 'lista_part_work'
    function moveFooterRow() {
        var table = $('#lista_part_work').find('table.tabela');
        if (table.length) {
            var tbody = table.find('tbody');
            var lastRow = tbody.find('tr').last();

            // Verifica se o último tr tem menos <td> do que o cabeçalho
            var thCount = table.find('thead th').length;
            var tdCount = lastRow.find('td').length;

            if (tdCount < thCount) {
                // Remove o último tr do tbody
                lastRow.remove();

                // Cria uma nova tabela para o rodapé
                /*
                var footerTable = $('<table class="tabela rodape" style="width:100%; margin-top:10px;"></table>');
                var footerTbody = $('<tbody></tbody>');
                footerTbody.append(lastRow);
                footerTable.append(footerTbody);

                // Insere a nova tabela após 'lista_part_work'
                $('#lista_part_work').after(footerTable);

                console.log('Rodapé movido para uma nova tabela.');
                */
            }
        }
    }

    // Função para depurar a tabela e identificar discrepâncias
    function debugTable() {
        var table = $('#lista_part_work').find('table.tabela');
        if (table.length) {
            var thCount = table.find('thead th').length;
            var tbodyRows = table.find('tbody tr');

            tbodyRows.each(function(index, tr) {
                var tdCount = $(tr).find('td').length;
                if (tdCount !== thCount) {
                    console.warn('Depuração: Linha ' + (index + 1) + ' possui ' + tdCount + ' <td> (esperado ' + thCount + ').');
                    // Destacar a linha problemática visualmente
                    // $(tr).css('background-color', '#ffcccc'); // Vermelho claro
                }
            });
        }
    }

    // Função para converter data de DD/MM/YYYY HH:mm para YYYY-MM-DD HH:mm e adicionar data-order
    function convertDateForSorting() {
        var table = $('#lista_part_work').find('table.tabela');
        if (table.length) {
            var dateColumnIndex = 5; // Índice da coluna "Data / Hora"

            table.find('tbody tr').each(function() {
                var td = $(this).find('td').eq(dateColumnIndex);
                var dateText = td.text().trim();

                // Verifica se o formato está correto
                var regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
                var match = dateText.match(regex);
                if (match) {
                    var day = match[1];
                    var month = match[2];
                    var year = match[3];
                    var hour = match[4];
                    var minute = match[5];

                    // Converter para formato ISO
                    var isoDate = `${year}-${month}-${day} ${hour}:${minute}`;

                    // Adicionar o atributo data-order
                    td.attr('data-order', isoDate);
                } else {
                    console.warn('Formato de data inválido na linha:', $(this).index() + 1, dateText);
                    // Opcional: Definir data-order para uma data mínima para evitar problemas de ordenação
                    td.attr('data-order', '0000-00-00 00:00');
                }
            });

            console.log('Conversão de datas concluída para ordenação.');
        }
    }

    // Função para converter datas e adicionar data-order
    function prepareDateSorting() {
        convertDateForSorting();
    }

    // Inicialização inicial dos Datepickers, mover rodapé, depurar e DataTables
    initializeDatepickers();
    moveFooterRow();
    debugTable();
    prepareDateSorting();
    initializeDataTables();

    // Configurar MutationObserver para reaplicar Datepickers, mover rodapé, depurar e DataTables
    var targetNode = document.getElementById('lista_part_work');
    if (targetNode) {
        var config = { childList: true, subtree: true };
        var callback = function(mutationsList, observer) {
            for(var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    initializeDatepickers();
                    moveFooterRow();
                    debugTable();
                    prepareDateSorting();
                    initializeDataTables();
                }
            }
        };
        var observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    // Redefinir g_rcnt para 500 e recarregar a lista de jogos
    window.g_rcnt = 500;

    // Função para recarregar a lista de jogos com g_rcnt = 500
    function redefineAndReload() {
        if (typeof go_menu_part_lista === 'function') {
            go_menu_part_lista(1, '');
        } else {
            // Se a função ainda não estiver disponível, tentar novamente após 100ms
            setTimeout(redefineAndReload, 100);
        }
    }

    // Chamar a função para redefinir e recarregar
    redefineAndReload();

})();
