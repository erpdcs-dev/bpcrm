
window.bpcrm_format_int= function(value) {
        var val =  frappe.format(value, { 'fieldtype' : 'Currency', 'precision' : 0});
        return val.split(">")[1].substr(2);
};

window.bpcrm_format_currency = function (value) {
        var price  = frappe.format(value, { 'fieldtype' : 'Currency'});
        return price.split(">")[1];
};

window.BPCRMNumberCard = class BPCRMNumberCard {
        constructor(controller,wrapper,number_card_ref) {
		this.controller 		= controller;
                this.wrapper 			= wrapper;
		this.ref			= number_card_ref;

	}

	make() { 
                this.container 			= document.createElement('div');
                this.container.className 	= "number-card";
                this.container.style.display 	= "inline-block";
                this.container.style.width 	= "15%";

                this.container.setAttribute("data-url",this.ref.url);

                this.container.onclick = function() { 
                        var url = this.getAttribute('data-url');
                        if (url) {
                                location.href=url;
                        }
                };
                this.wrapper.appendChild(this.container);
		this.load();
	}

	load() { 
		var me = this;
		frappe.call({
			'method' : 'frappe.client.get',
			'args' : { 
				'doctype' : 'bpcrm_number_card',
				'name' : this.ref.number_card
			},
			'async' : false,
			'callback' : function(r) { 
				me.number_card_doc = r.message;
				me.refresh();
			}
		});
        }

	refresh() { 
		var me = this;
		frappe.call({
			'method' : 'bpcrm.bpcrm_dashboard_api.get_number_card_content',
			'args' : { 
				'number_card' : this.number_card_doc.name
			},
			'callback' : function(r) { 
				me.make_container(r.message.result);
			}
		});
	}

        make_container(data) { 
		var result = '';
		if (this.number_card_doc.fieldtype == 'Int') { 
			result = bpcrm_format_int(data); 
		}
		else {
			result = bpcrm_format_currency(data);
		}
			
                var template = `
                <style>
                .number-cards-section {
                        padding:0px!important;
                        margin:0px!important;
                        text-align:center;
                }
                .number-card {
                        background-color:rgb(250,250,250);
                        border: 1px solid rgb(200,200,200);
                        border-radius:10px;
                        padding:0px!important;
                        margin:5px!important;
                        text-align:left;
                        vertical-align:top;
			font-size:10pt;
                }
                .number-card:hover {
                        cursor: pointer;
                }
                .number-card-header {
                        background-color: rgb(250,250,250);
                        border-radius:10px;
                        color: rgb(150,150,150);
                        font-size:10pt;
                        font-weight:bold;
                        padding:5px!important;
                        margin:0px!important;
                        width:100%;
                }
                .number-card-body {
                }
                .number-card-body-number {
                        font-size:10pt;
                        font-weight: bold;
                }
                .number-card-body-legend {
			display:none;
                        font-size:9pt;
                        font-weight: bold;
                }
                .number-card-body-deviation {
			display:none;
                        font-size:9pt;
                        font-weight: bold;
                }
                .number-card-body-deviation-green {
                        color:green;
                }
                .number-card-body-deviation-red {
                        color:red;
                }
               </style>
                        <div class="number-card-header" style="color:{{ color }};">
                        {{ title }}
                        </div>
                        <div class="col-lg-12 col-md-12 col-sm-12 number-card-body">
                                <div class="number-card-body-number" style="color:{{ color }};">{{ result }}</div>
                                <div class="number-card-body-legend">{{ legend }}</div>
                                <div class="number-card-body-deviation {% if deviation >= 0 %}number-card-deviation-green{% else %}number-card-deviation-red{% endif %}">{{ deviation }}</div>
                        </div>`;

		var context = {
			'result' : result,
			'legend' : '',
			'title' : this.ref.title,
			'url'	: this.ref.url,
			'color' : this.ref.color,
			'deviation' : 0 
		};
                var html 			= frappe.render(template,context);
                this.container.innerHTML 	= html;

                this.container.setAttribute("data-url",this.ref.url);
        }
};


window.BPCRMComponent = class BPCRMComponent { 

	constructor(controller, wrapper,field_def) { 
		this.controller = controller;
		this.wrapper = wrapper;
		this.field_def = field_def;
		this.input = false;
		this.select_box_template = `
		<div class="form-column field-{{ fieldname }} col-lg-{{ lg_width }} col-md-{{ md_width }}  col-sm-{{ sm_width }} {%if hidden == '1' %}hidden{% endif %}">
			<div class="frappe-control input-max-width" data-fieldtype="Select">
				<div class="form-group horizontal">
					<div class="clearfix">
					<label class="control-label" style="padding-right: 5px;">{{ label }}</label>
					<span class="help"></span>
				</div>
				<div class="control-input-wrapper">
					<div class="control-input">
						<select type="text" autocomplete="off" class="input-with-feedback
							{% if read_only == '1' %} disabled {% endif %}
							form-control ellipsis" maxlength="140" data-fieldtype="Select"
							id="{{ fieldname }}" 
							data-fieldname="{{ fieldname }}" placeholder="">
							<option value=""></option>
							{% for option in select_options %}
							<option value="{{ option.value }}" {% if option.value == default_value %}selected{% endif %}>{{ option.label }}</option>
							{% endfor %}
						</select>
					</div>
					<div class="control-value like-disabled-input bold" style="display: none;"></div>
						<div class="help-box small text-extra-muted hide"></div>
					</div>
				</div>
			</div>
		</div>
		`;
		this.input_template = `
		<div class="form-column field-{{ fieldname }} col-lg-{{ lg_width }} col-md-{{ md_width }}  col-sm-{{ sm_width }} {%if hidden == '1' %}hidden{% endif %}" >
			<div class="frappe-control input-max-width" data-fieldtype="{{ fieldtype }}">
				<div class="form-group horizontal">
					<div class="clearfix">
					<label class="control-label" style="padding-right: 5px;">{{ label }}</label>
					<span class="help"></span>
				</div>
				<div class="control-input-wrapper">
					<div class="control-input row" >
						<div class="">
						<input type="{{ type }}" size="{{ length }}" maxlength="140" id="{{ fieldname }}" autocomplete="off" class="input-with-feedback form-control bold" >
						</div>
						{%if icon != "" %}
						<div id="{{ fieldname }}_icon"  style="margin-left:3px;text-align:left;">
						<svg class="es-icon xes-line  icon-sm" aria-hidden="true">
							<use class="" href="{{ icon }}"></use>
						</svg>
						</div>
						{% endif %}
					</div>
					<div class="control-value like-disabled-input bold" style="display: none;"></div>
						<div class="help-box small text-extra-muted hide"></div>
					</div>
				</div>
			</div>
		</div>
		`;
	}

	make() {
		if (this.field_def.fieldtype == "Data") 		this.make_text_input();
		if (this.field_def.fieldtype == "Int") 			this.make_integer_input();
		if (this.field_def.fieldtype == "Currency") 		this.make_currency_input();
		if (this.field_def.fieldtype == "Float") 		this.make_float_input();
		if (this.field_def.fieldtype == "Date") 		this.make_date_input();
		if (this.field_def.fieldtype == "Time") 		this.make_time_input();
		if (this.field_def.fieldtype == "Select") 		this.make_select_input();
		if (this.field_def.fieldtype == "Link") 		this.make_link_input();
		if (this.field_def.fieldtype == "Check") 		this.make_check_input();
	}
	
	make_text_input() { 
		this.field_def.type = "text";
		var html = frappe.render(this.input_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_integer_input() { 
		this.field_def.type = "text";
		var html = frappe.render(this.input_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_currency_input() { 
		this.field_def.type = "text";
		var html = frappe.render(this.input_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_float_input() { 
		this.field_def.type = "text";
		var html = frappe.render(this.input_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_date_input() { 
		this.field_def.type = "date";
		var html = frappe.render(this.input_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_time_input() { 
		this.field_def.type = "time";
		var html = frappe.render(this.input_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_select_input() { 
		if (! this.field_def.select_options || this.field_def.select_options == undefined || this.field_def.select_options.length == 0) {
			var options = [];
			var ox = this.field_def.options.split("\n");
			for (var i=0; i < ox.length; i++) { 
				options.push( { 'label' :  ox[i], 'value' : ox[i]});
			}
			this.field_def.select_options = options;
		}
		var html = frappe.render(this.select_box_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_link_input() { 
		var me = this;
		if (! this.field_def.select_options || this.field_def.select_options == undefined || this.field_def.select_options.length == 0) {
			frappe.call({
				'method' : 'frappe.client.get_list',
				'args' : {
                				doctype  : this.field_def.doctype,
                				fields   : ["*"],
                				order_by : 'name',
                				limit_page_length: 0
            			},
				'async' : false,
				'callback' : function(r) {
					var options = [];
					for (var i=0; i < r.message.length; i++) { 
						options.push( { 'label' :  r.message[i]['name'], 'value' : r.message[i]['name']});
					}
					me.field_def.select_options = options;
				}
			});
		}
		var html = frappe.render(this.select_box_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_check_input() { 
		this.field_def = 'checkbox';
		var html = frappe.render(this.check_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_section_break() { 
		var html = frappe.render(this.section_break_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	make_button() { 
		var html = frappe.render(this.button_template,this.field_def);
		this.wrapper.innerHTML += html;
	}

	show() { 
		this.wrapper.querySelector('field-' + this.field_def.fieldname).classList.remove('hidden');
		
	}
	hide() { 
		this.wrapper.querySelector('field-' + this.field_def.fieldname).add.remove('hidden');
	}

	register_handlers() { 
		this.input = this.wrapper.querySelector("#" + this.field_def.fieldname);
		this.input.handler = this;
		if (this.field_def.fieldtype == "Button") {
			this.input.onclick = function() { 
				this.handler.clicked(this);
			};
		}
		else {
			this.input.onchange = function() {
				this.handler.changed(this);
			}
		}
	}

	clicked(element) { 
		if (this.controller.dispatch != undefined) { 
		this.controller.dispatch(element.id + ".clicked");
		}
	}

	changed(element) { 
		var value = '';
		if (this.fieldtype == 'Check') { 
			if (this.input.checked) value = '1';
			else value = '0';
		}
		else  { 
			value = element.value;
			if (this.field_def.fieldtype == "Int" && isNaN(parseInt(value))) {
				element.value = '';
				return;
			}
			if (this.field_def.fieldtype == "Float" && isNaN(parseFloat(value))) {
				element.value = '';
				return;
			}
			if (this.field_def.fieldtype == "Currency" && isNaN(parseFloat(Currency))) {
				element.value = '';
				return;
			}
		}
	
		if (this.controller.dispatch != undefined) { 
		this.controller.dispatch(element.id + ".changed",value);
		}
	}

	set_value(value) { 
		if (this.field_def.fieldtype == 'Check') { 
			if (value == '1') this.input.checked = true;
			else this.input.checked = false;
		}
		else this.input.value = value;
	}
};

window.BPCRMForm = class BPCRMForm {

	constructor(controller, id,title,fields,can_submit=true,can_cancel=true) { 
		this.controller = controller;
		this.id = id;
		this.title = title;
		this.fields = fields;
		this.doc = {};
		this.dialog = false;
		this.can_submit = can_submit;
		this.can_cancel = can_cancel;
	}

	make() { 
		var me = this;
		var blacklist_field_types = { 'Section Break' : 1, 'Column Break' : 1, 'Heading' : 1, 'Fold' : 1, 'Button' : 1 };
		for (var i=0; i < this.fields.length; i++) { 
			var field = this.fields[i];
			if (blacklist_field_types[field.fieldtype] == undefined) { 
				this.doc[field.fieldname] = '';
				if (field.default_value != undefined) { 
					this.doc[field.fieldname] = field.default_value;
				}
			}

		}

		this.dialog = new frappe.ui.Dialog({
    			title: this.title,
			size:'large',
			fields: this.fields,
   			static: true,
   			no_submit_on_enter: true
			});

		if (this.can_submit) { 
    			this.dialog.set_primary_action('Submit',
    			function(values) {
					me.submit(values)
    			});
		}
		if (this.can_cancel) { 
    			this.dialog.set_secondary_action_label('Cancel');
    			this.dialog.set_secondary_action(function(values) {
        				console.log(values);
					me.cancel(values)
    			});
		}

		this.dialog.show();
		this.dialog.set_values(this.doc);
		this.register_handlers();
	}

	submit() { 
		this.controller.dialog_dispatch(this.id + ".form.submit",this.doc);
	}

	cancel() { 
		this.controller.dialog_dispatch(this.id + ".form.cancel",this.doc);
	}

	hide() {
		this.dialog.hide();
	}

	register_handlers() { 
		var dict = this.dialog.fields_dict;
		for (var name in dict) { 
			var field = dict[name];
			if (field.has_input) { 
				if (field.df.fieldtype == "Button") {
					field.input.handler = this;
					field.input.onclick = function() { 
						this.handler.clicked(this);
					}
				}
				else {
					field.input.handler = this;
					field.input.onchange = function() { 
						this.handler.changed(this);
					}
				}
			}
		}
	}
	clicked(element) { 
		console.log("clicked");
		var fieldname = element.getAttribute('data-fieldname');
		if (this.controller.dialog_dispatch != undefined) { 
			this.controller.dialog_dispatch(this.id + "." + fieldname + ".clicked",this.doc);
		}
	}

	changed(element) { 
		var data = this.dialog.get_values();
		for (var name in data) { 
			this.doc[name] = data[name];
		}
		var fieldname = element.getAttribute('data-fieldname');
		if (this.controller.dialog_dispatch != undefined) { 
			this.controller.dialog_dispatch(this.id + "." + fieldname + ".changed",this.doc);
		}

	}
};

window.BPCRMFilter = class BPCRMFilter {
	constructor(controller,fields) { 
		this.controller = controller;
		this.wrapper = controller.wrapper;
		this.id = controller.id + "Filter";
		this.filter_wrapper = controller.filter_wrapper;
		this.fields = this.standard_filter();
		for (var i=0; i < fields.length; i++) { 
			this.fields.push(fields[i]);
		}
		this.components = {};
		this.filter_doc = {};
	}

	standard_filter() { 
		return [
			{	'fieldname' : 'search', 'label' : 'Search', 'fieldtype' : 'Data', 'default_value' : '', 'lg_width' : 6, 'md_width' : 6, 'sm_width' : 6 , 
				'hidden' : 0, 'options' : '', 'icon' : '', 'read_only' : 0, 'length' : '80'},
			{	'fieldname' : 'page_size', 'label' : 'Page Size', 'fieldtype' : 'Select', 'default_value' : '20', 'lg_width' : 2, 'md_width' : 2, 'sm_width' : 2 , 
				'hidden' : 0, 'options' : '20\n50\n100\n500\n1000\n2500', 'icon' : '', 'read_only' : 0},
			{	'fieldname' : 'sort_direction', 'label' : 'Sort', 'fieldtype' : 'Select', 'default_value' : 'Ascending', 'lg_width' : 2, 'md_width' : 2, 'sm_width' : 2 , 
				'hidden' : 0, 'options' : 'Ascending\nDescending', 'icon' : '', 'read_only' : 0},
		]
	}

	get() { 
		return this.filter_doc;
	}

	set(filter_doc) { 
		this.filter_doc = filter_doc;
		return true;
	}

	refresh() {
		for (var name in this.components) { 
			this.components[name].set_value(this.filter_doc[name]);
		}
		return true;
	}

	save() { 
		localStorage.setItem(this.id,JSON.stringify(this.filter_doc));
		return true;
	}
	load() {
		var data = localStorage.getItem(this.id);
		if (data == null ) return this.save(name);
		this.filter_doc = JSON.parse(data);
		return true;
	}

	prepare() { 
		for (var i=0; i < this.fields.length; i++) { 
			this.filter_doc[this.fields[i].fieldname] = this.fields[i].default_value;
			var inst = new BPCRMComponent(this, this.filter_wrapper,this.fields[i]);
			this.components[this.fields[i].fieldname] = inst;
		}
		return true;
	}
	make() { 
		this.prepare();
		for (var fieldname in this.components) { 
			this.components[fieldname].make();
		}
		for (var fieldname in this.components) { 
			this.components[fieldname].register_handlers();
		}
		this.refresh();
		this.load();
		this.refresh();
		return true;
	}

	dispatch(event,data) { 
		var dp = event.split(".");
		if (dp[1] == 'changed'){
			this.filter_doc[dp[0]] = data;
			this.save();
		}
		if (this.controller['refresh']) this.controller.refresh();
	}
};

window.BPCRMChart = class BPCRMChart {
	constructor(controller) { 
		this.controller 	= controller;
		this.wrapper 		= controller.wrapper;
		this.id 		= controller.id + 'Chart';
		this.filter_doc		= {
			'search'		: '',
			'page_size' 		: 20,
			'sort_direction' 	: 'Ascending',
			'sort_by' 		: 'name'
		};
		this.result		= [];
	}

	set_filter(filter_doc) { 
		this.filter_doc = filter_doc;
	}

	load(query_id) {
		var me = this;
		frappe.call({
			'method' : 'bpcrm.bpcrm.page.bpcrm_sales_cockpit.chart_query',
			'args' : {
				'query_id' : query_id,
				'filter' : JSON.stringify(this.filter_doc)
			},
			'async' : false,
			'callback' : function(r) { 
				console.log(r);
				me.result = r.message.result;
			}
		});

	}

	make() { 
		var template = `
		<div style="overflow-y:scroll;">
		<div id="chart" style="width:__width__px;"></div>
		</div>
		`;
		var x_axis 	= this.result.x_axis;
		var y_axis 	= this.result.y_axis;
		var title 	= this.result.title;
		var type 	= this.result.type;
		var color 	= this.result.color;
		var height 	= this.result.height;
		var width 	= this.result.width;
		var labels 	= [];
		var values 	= [];

		if (this.result.data.length == 0) return;

		for (var i=0; i < this.result.data.length; i++) { 
			var record = this.result.data[i];
			labels.push(record[x_axis]);
			values.push(record[y_axis]);
		}

		var data = {
			'labels' : labels,
			'datasets' : [
				{
					'name' : title,
					'values' : values
				}
			]
		};
		console.log(data);

		this.wrapper.querySelector('.bpcrm-tile-body').innerHTML = template.replace('__width__',width);

		const chart = new frappe.Chart("#chart", { 
    		title: title,
    		data: data,
    		type: type,
    		height: height,
    		colors: [ color ]
		});

	}

};

window.BPCRMMap = class BPCRMMap {
	constructor(controller,query) { 
		this.controller 	= controller;
		this.wrapper 		= controller.wrapper;
		this.id 		= controller.id + 'Map';
		this.query		= query;
		this.api_key		= "AIzaSyCt6AKQ0r4924zGfCb9MHV2P-A1JN-rbbQ";
	}

	make() { 
		var template = `
		<iframe
 			width="600"
  			height="450"
  			style="border:0"
  			loading="lazy"
  			allowfullscreen
  			referrerpolicy="no-referrer-when-downgrade"
  			src="https://www.google.com/maps/embed/v1/place?key={{ api_key }}
    			&q={{ query }}&maptype=satellite">
		</iframe>
		`;
		var context = { 'query' : this.query, 'api_key' : this.api_key };
		var html = frappe.render(template,context);
		this.wrapper.querySelector('.bpcrm-tile-body').innerHTML = html;
	}

};

window.BPCRMList = class BPCRMList {
	constructor(controller,wrapper,list_definition) { 
		this.controller = controller;
		this.id = controller.id + 'List';
		this.wrapper = wrapper;
		this.list_definition = list_definition;
		this.list_globals = this.list_definition.globals;
		this.list_fields = this.list_definition.fields;
		this.filter_doc = false;
		this.list_template = false;
	}

	set_filter(filter_doc) { 
		this.filter_doc = filter_doc;
	}

	set_template(template) {
		this.list_template = template;
	}

	load_data() { 
		var me = this;
		frappe.call({
			'method' : 'bpcrm.bpcrm.page.bpcrm_sales_cockpit.get_data',
			'args' : {
				'doctype' : this.list_definition.globals.doctype,
				'search' : this.list_definition.search,
				'filter' : JSON.stringify(this.filter_doc)
			},
			'async' : false,
			'callback' : function(r) { 
				me.list_data = r.message.result;
			}
		});
	}

	dialog_dispatch(event,data) { 
		console.log(event);
		console.log(data);
	}

	refresh() { 
		this.load_data();
		this.render_header();
		this.render_content();
		this.register_handlers();
	}

	render_header() { 
		var template = `
			<style>
			.bpcrm-list-header-field {
				display: inline-block;
				font-size:10pt;
				font-weight:bold;
			}
			.bpcrm-list-content-field {
				display: inline-block;
				font-size:10pt;
				font-weight:bold;
			}
			.bpcrm-list-row { 
				margin-top:5px;
			}
			.bpcrm-list-row:nth-child(even){
                        	background-color:rgb(240,240,240);
                	}
                	.bpcrm-list-row:nth-child(odd){
                        	background-color:rgb(220,220,220);
                	}
                	.bpcrm-list-row:nth-child(even):hover{
                        	cursor:pointer;
                        	background-color:rgb(250,250,250);
                	}
                	.bpcrm-list-row:nth-child(odd):hover{
                        	cursor:pointer;
                        	background-color:rgb(250,250,250);
                	}
			.bpcrm-icon-section {
				display:inline-block;
				width:80px;
			}
			.bpcrm-list-add-record {
				display: inline-block;
			}
			.bpcrm-list-edit-record {
				display: inline-block;
				margin-left: 5px;
			}
			.bpcrm-list-delete-record {
				display: inline-block;
				margin-left: 5px;
			}
			</style>
			<div class="bpcrm-icon-section">
				{% if actions.can_create %}<div class="bpcrm-list-add-record"  style="font-size:20pt;font-weight:bold;">+</div>{% else %}<div class=""  style="font-size:20pt;font-weight:bold;">&nbsp;</div>{% endif %}
			</div>
			{% for field in fields %} 
				<div class="bpcrm-list-header-field" id="hdr_{{ field.fieldname }}" style="width:{{ field.width }}px;text-align:left;">
				{{ field.label }}
				</div>
			{% endfor %}
		`;
		var html=frappe.render(template,this.list_definition);
		this.wrapper.querySelector('.bpcrm-flow-label-container').innerHTML = html;
		this.wrapper.classList.remove('hidden');
	}

	render_content() { 
		var template = `
			{% for record in records %}
				<div class="bpcrm-list-row" data-record-id="{{ record.name }}">
				<div class="bpcrm-icon-section">
					{% if def.actions.can_edit %}<div class="bpcrm-list-edit-record" data-record-id="{{ record.name }}">
						<svg class="icon icon-sm" aria-hidden="true">
                                                        <use class="" href="#icon-edit"></use>
                                                </svg>
					</div>{% endif %}
					{% if def.actions.can_delete %}<div class="bpcrm-list-delete-record" data-record-id="{{ record.name }}">
						<svg class="icon icon-sm" aria-hidden="true">
                                                        <use class="" href="#icon-delete"></use>
                                                </svg>
					</div>{% endif %}
				</div>
				{% for field in def.fields %} 
					<div class="bpcrm-list-content-field" data-record-id="{{ record.name }}" data-field-id="{{ field.fieldname }}" style="width:{{ field.width }}px;text-align:left;">
					{{ record[field.fieldname] }}
					</div>
				{% endfor %}
				</div>
			{% endfor %}
		`;
		var html = '';
		if (this.list_template) {
			html=frappe.render(this.list_template,{ 'records' : this.list_data, 'def' : this.list_definition});
		} else {
			html=frappe.render(template,{ 'records' : this.list_data, 'def' : this.list_definition});
		}
		this.wrapper.querySelector('.bpcrm-flow-content-container').innerHTML = html;
		this.wrapper.classList.remove('hidden');
	}

	register_handlers() { 
		var me = this;	
		this.wrapper.querySelectorAll('.bpcrm-list-add-record').forEach(function(element) { 
			element.handler = me;
			element.onclick = function() { 
				this.handler.add_record(this);
			};
		});
		this.wrapper.querySelectorAll('.bpcrm-list-edit-record').forEach(function(element) { 
			element.handler = me;
			element.onclick = function() { 
				this.handler.edit_record(this);
			};
		});
		this.wrapper.querySelectorAll('.bpcrm-list-delete-record').forEach(function(element) { 
			element.handler = me;
			element.onclick = function() { 
				this.handler.delete_record(this);
			};
		});
		this.wrapper.querySelectorAll('.bpcrm-list-content-field').forEach(function(element) { 
			element.handler = me;
			element.onclick = function() { 
				this.handler.select_record(this);
			};
		});
	}

	select_record(element) { 
		var record_id = element.getAttribute('data-record-id');
		var field_id = element.getAttribute('data-field-id');
		if (this.controller['list_dispatch'] != undefined ) { 
			this.controller.list_dispatch(this.id + ".recordSelected",{ 'record_id' : record_id, 'field_id' : field_id});
		}
	}
	add_record(element) { 
		if (this.controller['list_dispatch'] != undefined ) { 
			this.controller.list_dispatch(this.id + ".add",'');
		}
	}
	edit_record(element) { 
		if (this.controller['list_dispatch'] != undefined ) { 
			this.controller.list_dispatch(this.id + ".edit",element.getAttribute('data-record-id'));
		}
	}
	delete_record(element) { 
		if (this.controller['list_dispatch'] != undefined ) { 
			this.controller.list_dispatch(this.id + ".delete",element.getAttribute('data-record-id'));
		}
	}
};

window.BPCRMTile = class BPCRMTile { 
	
	constructor(controller,tile) { 
		this.controller = controller;
		this.wrapper = controller.wrapper;
		this.tile = tile;
		this.tile_wrapper = this.wrapper.querySelector('.bpcrm-tile[data-tile-id="' + this.tile.id + '"]');
		this.app = false;
	}

	message(text) { 
		console.log(new Date().toLocaleString() + " : " + this.tile.id + " - " + text);
	}

	is_collection_ready() { 
		return this.controller.is_collection_ready();
	}

	invoke(event,data) { 
		if (! this.app) return false;
		if (this.app['event_handler'] != undefined) {
			return this.app.event_handler(event,data);
		}
		return false;
	}

	fire(tile_id,event,data) { 
		var tile = this.controller.get_tile(tile_id);
		if (tile && tile != undefined) { 
			return tile.invoke(event,data);
		}
		return false;
	}

	make() { 
		var template =`
		<style>
		</style>
		<div class="col-lg-12 col-md-12 col-sm-12 row bpcrm-tile-header">
			<div class="col-lg-9 col-md-9 col-sm-9 bpcrm-tile-header-title">{{ title }}</div>
			<div class="col-lg-3 col-md-3 col-sm-3 bpcrm-tile-header-icons hidden">
				<svg class="icon icon-md bpcrm-refresh" style="background-color:rgb(255,255,255);" aria-hidden="true">
					<use class="mb-1" href="#icon-refresh"></use>
				</svg>
				<svg class="icon icon-md bpcrm-small hidden" style="background-color:rgb(255,255,255);" aria-hidden="true">
					<use class="mb-1" href="#icon-website"></use>
				</svg>
				<svg class="icon line  icon-md bpcrm-large" style="background-color:rgb(255,255,255);" aria-hidden="true">
					<use class="mb-1" href="#icon-website"></use>
				</svg>
			</div>
		</div>
		<div class="col-lg-12 col-md-12 col-sm-12 bpcrm-tile-body">
			<div class="col-lg-12 col-md-12 col-sm-12 row bpcrm-tile-filter">
			</div>
			<div class="col-lg-12 col-md-12 col-sm-12 bpcrm-tile-content hidden" style="height: {{ list_height_vh}}vh;">
				<div class="bpcrm-flow-label-container">
				</div>
				<div class="bpcrm-flow-content-container">
				</div>
			</div>
			<div class="col-lg-12 col-md-12 col-sm-12 bpcrm-tile-footer">
			</div>
		</div>
		`;
		var html = frappe.render(template,this.tile);
		this.tile_wrapper.innerHTML = html;
		this.tile_wrapper.querySelector('.bpcrm-small').handler = this;
		this.tile_wrapper.querySelector('.bpcrm-small').onclick = function() { 
			this.handler.minimize();
		};
		this.tile_wrapper.querySelector('.bpcrm-large').handler = this;
		this.tile_wrapper.querySelector('.bpcrm-large').onclick = function() { 
			this.handler.maximize();
		};
		this.tile_wrapper.querySelector('.bpcrm-refresh').handler = this;
		this.tile_wrapper.querySelector('.bpcrm-refresh').onclick = function() { 
			this.handler.refresh();
		};
		if (this.tile.maximized) { 
			this.maximize();
		}
		if (this.tile.hidden) { 
			this.tile_wrapper.classList.add('hidden');
		}
		if (this.tile.can_maximize) { 
			this.tile_wrapper.querySelector('.bpcrm-tile-header-icons').classList.remove('hidden');
		}
		this.start_app();
	}

	start_app() { 
		var component = this.tile.component;
		if (! component) return;
		this.app = eval("new " + component + "(this);");
		this.app.make();
	}

	refresh() { 
		if (this.app['refresh'] != undefined) { 
			this.app.refresh();
		}
	}

	maximize() { 
		this.wrapper.querySelectorAll('.bpcrm-tile').forEach(function(element) {
			element.classList.add('hidden');
		});
		this.tile_wrapper.classList.remove('col-lg-' + this.tile.lg_width);
		this.tile_wrapper.classList.remove('col-md-' + this.tile.md_width);
		this.tile_wrapper.classList.remove('col-sm-' + this.tile.sm_width);
		this.tile_wrapper.classList.add('col-lg-12');
		this.tile_wrapper.classList.add('col-md-12');
		this.tile_wrapper.classList.add('col-sm-12');
		this.tile_wrapper.classList.remove('hidden');
		this.tile_wrapper.querySelector('.bpcrm-small').classList.remove('hidden');
		this.tile_wrapper.querySelector('.bpcrm-large').classList.add('hidden');
		this.tile_wrapper.style.height = '73vh';
		var new_content_height = 73 - parseInt(this.tile.height_vh) + parseInt(this.tile.list_height_vh);
		this.tile_wrapper.querySelector('.bpcrm-tile-content').style.height = new_content_height + "vh";
	}
	minimize() { 
		this.tile_wrapper.classList.add('hidden');
		this.tile_wrapper.classList.remove('col-lg-12');
		this.tile_wrapper.classList.remove('col-md-12');
		this.tile_wrapper.classList.remove('col-sm-12');
		this.tile_wrapper.classList.add('col-lg-' + this.tile.lg_width);
		this.tile_wrapper.classList.add('col-md-' + this.tile.md_width);
		this.tile_wrapper.classList.add('col-sm-' + this.tile.sm_width);
		this.wrapper.querySelectorAll('.bpcrm-tile').forEach(function(element) {
			element.classList.remove('hidden');
		});
		this.tile_wrapper.querySelector('.bpcrm-small').classList.add('hidden');
		this.tile_wrapper.querySelector('.bpcrm-large').classList.remove('hidden');
		this.tile_wrapper.style.height = this.tile.height + 'vh';
		this.tile_wrapper.querySelector('.bpcrm-tile-content').style.height = this.tile.list_height_vh + "vh";
	}
};

window.BPCRMTileCollection = class BPCRMTileCollection { 

	constructor(controller,collection) { 
		this.controller = controller;
		this.wrapper = controller.wrapper;
		this.collection = collection;
		this.tiles = {};
		this.collection_ready = false;
	}

	is_collection_ready() {
		return this.collection_ready;
	}

	get_tile(tile_id) { 
		return this.tiles[tile_id];
	}
	
	make_grid() { 
		var template = `
		<style> 
		.bpcrm-tile {
			margin-top:5px;
			overflow-y: scroll;
		}
		.bpcrm-tile-header { 
			padding:0px!important;
			margin: 0px!important;
			background-color: rgb(180,180,180);
			font-size:12pt;
			font-weight:bold;
			color: rgb(255,255,255);
		}
		.bpcrm-tile-header-title {
			padding:5px!important;
			margin: 0px!important;
		}
		.bpcrm-tile-header-icons {
			text-align: right;
		}
		.bpcrm-tile-body {
			padding:0px!important;
			margin: 0px!important;
			background-color: rgb(250,250,250);
		}
		.bpcrm-tile-filter {
			padding:0px!important;
			margin: 0px!important;
			padding-left:5px!important;
			font-size:10pt;
		}
		.bpcrm-tile-content {
			padding:5px!important;
			margin: 0px!important;
			overflow:scroll;
		}
		.bpcrm-flow-label-container {
			display:block;
			width: 3800px;
			border-bottom: 1px solid rgb(80,80,80);
		}
		.bpcrm-flow-content-container {
			display:block;
			width: 3800px;
		}
		.bpcrm-refresh {
			margin-right: 10px;
		}
		input {
		 font-size:10pt;
		 }

		</style>
			{% for tile in tiles %}
				<div class="bpcrm-tile col-lg-{{ tile.lg_width }} col-md-{{ tile.md_width }} col-sm-{{ tile.sm_width }}" style="height:{{ tile.height_vh }}vh;" data-tile-id="{{ tile.id }}"></div>
			{% endfor %}
		`;
		var html = frappe.render(template,this.collection);
		this.wrapper.querySelector('.bpcrm-dashboard-body').innerHTML = html;
	}

	make() { 
		this.collection_ready = false;
		this.make_grid();
		for (var i=0; i < this.collection.tiles.length; i++) { 
			var tile = this.collection.tiles[i];
			this.tiles[tile.id] = new BPCRMTile(this,tile);
			this.tiles[tile.id].make();
		}
		this.collection_ready = true;
		this.ready();
	}

	ready() { 
		for (var tile_id in this.tiles) { 
			this.tiles[tile_id].invoke('collectionReady','');
		}
	}
};

window.BPCRMDashboard = class BPCRMDashboard { 

	constructor(page_wrapper) { 
		this.wrapper = page_wrapper.querySelector('.page-body');
		this.dashboard_id = 'Standard';
		this.number_cards = [];
		this.current_tile_collection = false;
		this.tile_collections = {};
		this.tiles = [];
	}

	switch_dashboard(id) { 
		this.dashboard_id = id;
		this.load_dashboard();
	}

	load_dashboard() { 
		var me = this;
		frappe.call({
			'method' : 'frappe.client.get',
			'args' : { 
				'doctype' : 'bpcrm_dashboard',
				'name' : this.dashboard_id
			},
			'async' : false,
			'callback' : function(r) { 
				me.dashboard_doc = r.message;
				me.load_collections();
				me.make();
			}
		});
	}
	load_collections() { 
		var me = this;
		for (var i=0; i < this.dashboard_doc.tile_collections.length; i++) { 
			var collection = this.dashboard_doc.tile_collections[i];
			if (i == 0) { 
				this.current_tile_collection = collection.tile_collection;
			}
			frappe.call({
				'method' : 'frappe.client.get',
				'args' : {
					'doctype' : 'bpcrm_tile_collection',
					'name' : collection.tile_collection
				},
				'async' : false,
				'callback' : function(r) {
					me.tile_collections[collection.tile_collection] = r.message;
					for (var i=0; i < r.message.tiles.length; i++) { 
						if (r.message.tiles[i].code) { 
							eval(r.message.tiles[i].code);
						}
					}
				}
			});
		}
		return true;
	}

	make() { 
		var template = `
		<style>
		.bpcrm-dashboard-number-cards {
			text-align: center!important;
		}
		.bpcrm-dashboard-container {
			border: 1px solid rgb(0,0,0);
			width:98vw;
			height:85vh;
			overflow-y:scroll;
		}
		.bpcrm-dashboard-body { 
		}
		</style>
			<div class="col-lg-12 col-md-12 col-sm-12 rowi bpcrm-dashboard-container" >
				<div class="col-lg-12 col-md-12 col-sm-12 bpcrm-dashboard-number-cards" >
				</div>
				<div class="col-lg-12 col-md-12 col-sm-12 bpcrm-dashboard-navbar">
				</div>
				<div class="col-lg-12 col-md-12 col-sm-12 row bpcrm-dashboard-body">
				</div>
			</div>
		`;
		this.wrapper.innerHTML=template;
		this.make_number_cards();
		this.make_navbar();
		this.open_initial_tile_collection();
	}

	make_number_cards() { 
		var nc_wrapper = this.wrapper.querySelector('.bpcrm-dashboard-number-cards');
		for (var i=0; i < this.dashboard_doc.number_cards.length; i++) { 
			var number_card = new BPCRMNumberCard(this,nc_wrapper,this.dashboard_doc.number_cards[i]);
			number_card.make();
			this.number_cards.push();
		}
		return true;
	}

	make_navbar() { 
		var me = this;
		var template = `
		  <style>
                .bpcrm-dashboard-navbar {
                        margin-top:10px;
                        font-size:10pt;
                        text-align:center;
                }
                .bpcrm-cockpit-active {
                        background-color:rgb(140,140,140);
                        color: rgb(255,255,255);
                        font-weight: bold;
                }
                .bpcrm-cockpit-active:hover {
                        cursor: pointer;
                }
                .bpcrm-cockpit-tab { 
                        border-bottom: 1px solid rgb(80,80,80);
                        border-radius: 10px;
                        }
                .bpcrm-cockpit-inactive {
                        background-color:rgb(230,230,230);
                        color: rgb(120,120,120);
                }
                .bpcrm-cockpit-inactive:hover {
                        background-color:rgb(240,240,240);
                        color: rgb(120,120,120);
                        cursor: pointer;
                }
                .bpcrm-cockpit-nav {
			display: inline-block;
                        xborder:1px solid rgb(0,0,0);
                        border-radius:5px;
                        margin:5px;
                        }
                input:hover { 
                        cursor:pointer;
                        }
                </style>

		  {% for collection in tile_collections %}
                        <div class="col-lg-2 col-md-2 col-sm-3 bpcrm-collection-{{ collection.tile_collection }} bpcrm-cockpit-nav bpcrm-cockpit-inactive" data-collection-id="{{ collection.tile_collection }}">{{ collection.menu_label }}</div>
		  {% endfor %}
		`;
		var html = frappe.render(template,this.dashboard_doc);
		this.wrapper.querySelector('.bpcrm-dashboard-navbar').innerHTML = html;
		this.wrapper.querySelector('.bpcrm-dashboard-navbar').querySelectorAll('.bpcrm-cockpit-nav').forEach(function(element) { 
			element.handler = me;
			element.onclick = function() { 
				this.handler.navbar_clicked(this);
			};
		});
		
	}

	open_initial_tile_collection() { 
		var collection = this.tile_collections[this.current_tile_collection];
		this.tile_collection = new BPCRMTileCollection(this,collection);
		this.tile_collection.make();
		this.navbar_inactive();
		this.wrapper.querySelector('.bpcrm-collection-' + this.current_tile_collection).classList.remove('bpcrm-cockpit-inactive');
		this.wrapper.querySelector('.bpcrm-collection-' + this.current_tile_collection).classList.add('bpcrm-cockpit-active');
	}

	navbar_inactive() {
		this.wrapper.querySelectorAll('.bpcrm-cockpit-nav').forEach(function(element) { 
			element.classList.remove("bpcrm-cockpit-active");
			element.classList.add("bpcrm-cockpit-inactive");
		});
	}

	navbar_clicked(element) { 
		console.log('clicked');
		var collection_id = element.getAttribute('data-collection-id');
		var collection = this.tile_collections[collection_id];
		this.tile_collection = new BPCRMTileCollection(this,collection);
		this.tile_collection.make();
		this.navbar_inactive();
		element.classList.remove('bpcrm-cockpit-inactive');
		element.classList.add('bpcrm-cockpit-active');
	}

};


frappe.pages['bpcrm_sales_cockpit'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'BP Dashboard',
		single_column: true
	});
	page.bpcrm = new BPCRMDashboard(wrapper);
	page.bpcrm.load_dashboard();
}
