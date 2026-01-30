
window.BPCRMLeadsManager = class BPCRMLeadsManager {

        constructor(controller) {
                this.id = "LeadsManager";
                this.controller = controller;
                this.wrapper = controller.wrapper;
                this.body_wrapper = this.wrapper.querySelector('.bpcrm-tile-body');
                this.filter_wrapper = this.body_wrapper.querySelector('.bpcrm-tile-filter');
                this.content_wrapper = this.body_wrapper.querySelector('.bpcrm-tile-content');
                this.list = false;
        }
        make_filter() { 
                var filter_fields = [
                        {       'fieldname' : 'sort_by', 'label' : 'By', 'fieldtype' : 'Select', 'default_value' : 'name', 'lg_width' : 2, 'md_width' : 2, 'sm_width' : 2 ,
                                'hidden' : 0, 'options' : '', 'icon' : '', 'read_only' : 0,
                                'select_options' : [
                                                { 'value' : 'name', 'label' : 'ID' },
                                                { 'value' : 'display_name', 'label' : 'Name' },
                                                { 'value' : 'city', 'label' : 'City' },
                                                { 'value' : 'country', 'label' : 'Country' },
                                ],
                        },
                        {       'fieldname' : 'email', 'label' : 'Email', 'fieldtype' : 'Data', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'icon' : '', 'read_only' : 0},
                        {       'fieldname' : 'city', 'label' : 'City', 'fieldtype' : 'Data', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'doctype' : '', 'icon' : '', 'read_only' : 0},
                        {       'fieldname' : 'country', 'label' : 'Country', 'fieldtype' : 'Link', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'doctype' : 'Country', 'icon' : '', 'read_only' : 0},
                ];
                this.filter = new BPCRMFilter(this,filter_fields);
                this.filter.make();
        }

        make_list() { 
                var list_definition = { 
                        'globals' : {
                                'doctype' : 'bpcrm_lead'
                        },
                        'fields' : [
                                        {       'fieldname' : 'display_name', 'label' : 'Name', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'email', 'label' : 'Email', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'mobile', 'label' : 'Mobile', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'phone', 'label' : 'Phone', 'fieldtype' : 'Data', 'width' : 300  },
                        ],
                        'actions' : {
                                'can_create'    : 1,
                                'can_edit'      : 1,
                                'can_view'      : 0,
                                'can_delete'    : 1
                        }
                };
                this.list = new BPCRMList(this,this.content_wrapper,list_definition);
                this.list.set_filter(this.filter.get());
                this.list.refresh();
        }

        make_detail_dialog(record_id) { 
                if (record_id) {
                        open("/app/bpcrm_lead/" + record_id,"__blank__");
                }
                else {
                        open("/app/bpcrm_lead/new","__blank__");
                }
        }

	       delete_record(record_id) { 
                var me = this;
                frappe.confirm(
                        'Do you really want to delete this lead?',
                        function(){
                                frappe.call({
                                        'method' : 'frappe.client.delete',
                                        'args' : {
                                                'doctype' : 'bpcrm_lead',
                                                'name' : record_id
                                        },
                                        'callback' : function(r) { 
                                                frappe.msgprint("Lead has been deleted");
                                                me.refresh();
                                        }
                                });
                        },
                        function(){
                        }
                );
        }

        make() { 
                this.make_filter();
                this.make_list();
        }

        refresh() { 
                this.list.set_filter(this.filter.get());
                this.list.refresh();
        }

        list_dispatch(event,data) { 
                console.log(event);
                console.log(data);
                if (event == "LeadsManagerList.add") return this.make_detail_dialog(false);
                if (event == "LeadsManagerList.edit") return this.make_detail_dialog(data);
                if (event == "LeadsManagerList.delete") return this.delete_record(data);
        }

};


// V2

window.BPCRMLeadsManager = class BPCRMLeadsManager {

        constructor(controller) {
                this.id                 = "LeadsManager";
                this.controller         = controller;
                this.wrapper            = controller.tile_wrapper;
                this.body_wrapper       = this.wrapper.querySelector('.bpcrm-tile-body');
                this.filter_wrapper     = this.body_wrapper.querySelector('.bpcrm-tile-filter');
                this.content_wrapper    = this.body_wrapper.querySelector('.bpcrm-tile-content');
                this.list               = false;
        }
        make_filter() {
                var filter_fields = [
                        {       'fieldname' : 'sort_by', 'label' : 'By', 'fieldtype' : 'Select', 'default_value' : 'name', 'lg_width' : 2, 'md_width' : 2, 'sm_width' : 2 ,
                                'hidden' : 0, 'options' : '', 'icon' : '', 'read_only' : 0,
                                'select_options' : [
                                                { 'value' : 'name', 'label' : 'ID' },
                                                { 'value' : 'display_name', 'label' : 'Name' },
                                                { 'value' : 'city', 'label' : 'City' },
                                                { 'value' : 'country', 'label' : 'Country' },
                                ],
                        },
                        {       'fieldname' : 'email', 'label' : 'Email', 'fieldtype' : 'Data', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'icon' : '', 'read_only' : 0},
                        {       'fieldname' : 'city', 'label' : 'City', 'fieldtype' : 'Data', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'doctype' : '', 'icon' : '', 'read_only' : 0},
                        {       'fieldname' : 'country', 'label' : 'Country', 'fieldtype' : 'Link', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'doctype' : 'Country', 'icon' : '', 'read_only' : 0},
                ];
                this.filter = new BPCRMFilter(this,filter_fields);
                this.filter.make();
        }

        make_list() {
                var list_definition = {
                        'globals' : {
                                'doctype' : 'bpcrm_lead'
                        },
                        'search' : [
                                        'display_name'
                        ],
                        'fields' : [
                                        {       'fieldname' : 'display_name', 'label' : 'Name', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'email', 'label' : 'Email', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'mobile', 'label' : 'Mobile', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'phone', 'label' : 'Phone', 'fieldtype' : 'Data', 'width' : 300  },
                        ],
                        'actions' : {
                                'can_create'    : 1,
                                'can_edit'      : 1,
                                'can_view'      : 0,
                                'can_delete'    : 1
                        }
                };
                this.list = new BPCRMList(this,this.content_wrapper,list_definition);
                this.list.set_filter(this.filter.get());
                this.list.refresh();
        }

        make_detail_dialog(record_id) {
                if (record_id) {
                        open("/app/bpcrm_lead/" + record_id,"__blank__");
                }
                else {
                        open("/app/bpcrm_lead/new","__blank__");
                }
        }

        delete_record(record_id) {
                var me = this;
                frappe.confirm(
                        'Do you really want to delete this lead?',
                        function(){
                                frappe.call({
                                        'method' : 'frappe.client.delete',
                                        'args' : {
                                                'doctype' : 'bpcrm_lead',
                                                'name' : record_id
                                        },
                                        'callback' : function(r) {
                                                frappe.msgprint("Lead has been deleted");
                                                me.refresh();
                                        }
                                });
                        },
                        function(){
                        }
                );
        }

        make() {
                this.make_filter();
                this.make_list();
        }

        refresh() {
                this.list.set_filter(this.filter.get());
                this.list.refresh();
        }

        list_dispatch(event,data) {
                if (event == "LeadsManagerList.add") return this.make_detail_dialog(false);
                if (event == "LeadsManagerList.edit") return this.make_detail_dialog(data);
                if (event == "LeadsManagerList.delete") return this.delete_record(data);
        }

};

window.BPCRMCustomersManager = class BPCRMCustomersManager {

        constructor(controller) {
                this.id                 = "CustomersManager";
                this.controller         = controller;
                this.wrapper            = controller.tile_wrapper;
                this.body_wrapper       = this.wrapper.querySelector('.bpcrm-tile-body');
                this.filter_wrapper     = this.body_wrapper.querySelector('.bpcrm-tile-filter');
                this.content_wrapper    = this.body_wrapper.querySelector('.bpcrm-tile-content');
                this.list               = false;
        }
        make_filter() {
                var filter_fields = [
                        {       'fieldname' : 'sort_by', 'label' : 'By', 'fieldtype' : 'Select', 'default_value' : 'name', 'lg_width' : 2, 'md_width' : 2, 'sm_width' : 2 ,
                                'hidden' : 0, 'options' : '', 'icon' : '', 'read_only' : 0,
                                'select_options' : [
                                                { 'value' : 'name', 'label' : 'ID' },
                                                { 'value' : 'company_name', 'label' : 'Company' },
                                                { 'value' : 'city', 'label' : 'City' },
                                                { 'value' : 'country', 'label' : 'Country' },
                                ],
                        },
                        {       'fieldname' : 'container_type', 'label' : 'Container Type', 'fieldtype' : 'Data', 'default_value' : 'Customer', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'doctype' : '', 'icon' : '', 'read_only' : 1, 'hidden' : 1 },
                        {       'fieldname' : 'city', 'label' : 'City', 'fieldtype' : 'Data', 'default_value' : '', 'lg_width' : 4, 'md_width' : 4, 'sm_width' : 4 ,
                                'hidden' : 0, 'options' : '', 'doctype' : '', 'icon' : '', 'read_only' : 0, 'length' : 40 },
                        {       'fieldname' : 'country', 'label' : 'Country', 'fieldtype' : 'Link', 'default_value' : '', 'lg_width' : 4, 'md_width' : 4, 'sm_width' : 4 ,
                                'hidden' : 0, 'options' : '', 'doctype' : 'Country', 'icon' : '', 'read_only' : 0},
                        {       'fieldname' : 'manufacturer', 'label' : 'Manufacturer', 'fieldtype' : 'Link', 'default_value' : '', 'lg_width' : 3, 'md_width' : 3, 'sm_width' : 3 ,
                                'hidden' : 0, 'options' : '', 'doctype' : 'mxcm_manufacturer', 'icon' : '', 'read_only' : 0},
                ];
                this.filter = new BPCRMFilter(this,filter_fields);
                this.filter.make();
        }

        make_list() {
                var list_definition = {
                        'globals' : {
                                'doctype' : 'mxcm_container'
                        },
                        'search' : [
                                        'company_name'
                        ],
                        'fields' : [
                                        {       'fieldname' : 'ref_duns_nb', 'label' : 'DUNS', 'fieldtype' : 'Data', 'width' : 100  },
                                        {       'fieldname' : 'company_name', 'label' : 'Company', 'fieldtype' : 'Data', 'width' : 300  },
                                        {       'fieldname' : 'city', 'label' : 'City', 'fieldtype' : 'Data', 'width' : 200  },
                                        {       'fieldname' : 'zip', 'label' : 'Phone', 'fieldtype' : 'Data', 'width' : 200  },
                                        {       'fieldname' : 'country', 'label' : 'Country', 'fieldtype' : 'Data', 'width' : 200  },
                                        {       'fieldname' : 'potential_level', 'label' : 'Potential Level', 'fieldtype' : 'Data', 'width' : 200  },
                        ],
                        'actions' : {
                                'can_create'    : 0,
                                'can_edit'      : 1,
                                'can_view'      : 0,
                                'can_delete'    : 0
                        }
                };
                this.list = new BPCRMList(this,this.content_wrapper,list_definition);
                this.list.set_filter(this.filter.get());
                this.list.refresh();
        }

        make_detail_dialog(record_id) {
                if (record_id) {
                        open("/app/mxcm_container/" + record_id,"__blank__");
                }
                else {
                        open("/app/mxcm_container/new","__blank__");
                }
        }

        delete_record(record_id) {
                var me = this;
                frappe.confirm(
                        'Do you really want to delete this customer?',
                        function(){
                                frappe.call({
                                        'method' : 'frappe.client.delete',
                                        'args' : {
                                                'doctype' : 'mxcm_container',
                                                'name' : record_id
                                        },
                                        'callback' : function(r) {
                                                frappe.msgprint("Customer has been deleted");
                                                me.refresh();
                                        }
                                });
                        },
                        function(){
                        }
                );
        }

        make() {
                this.make_filter();
                this.make_list();
        }

        refresh() {
                this.list.set_filter(this.filter.get());
                this.list.refresh();
        }

        list_dispatch(event,data) {
                if (event == "CustomersManagerList.add") return this.make_detail_dialog(false);
                if (event == "CustomersManagerList.edit") return this.make_detail_dialog(data);
                if (event == "CustomersManagerList.delete") return this.delete_record(data);
        }

};

