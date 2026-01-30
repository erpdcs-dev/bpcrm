import os
import sys
import json
import datetime
import frappe
from frappe import _

@frappe.whitelist()
def get_data(doctype,search,filter):

    try:
        filter_doc = json.loads(filter)
    except:
        frappe.throw(_("Cannot unserialize filter data"))

    page_size = filter_doc['page_size']
    if not page_size:
        page_size = 20

    sort_direction = filter_doc['sort_direction']
    sort_by = filter_doc['sort_by']

    if not sort_by:
        sort_by = "name"

    if sort_direction == "Descending":
        sort_by += " desc "
    del(filter_doc['page_size'])
    del(filter_doc['sort_direction'])
    del(filter_doc['sort_by'])

    search_expr = ""
    if filter_doc['search']:
        condition = "="
        value = filter_doc['search']
        if value.find("*") >= 0:
            value = value.replace("*","%")
            condition = "like"

        search_fields = json.loads(search)
        for i in range(len(search_fields)):
            if search_expr:
                search_expr += " or "
            search_expr += search_fields[i] + " " + condition + " " + frappe.db.escape(str(value))

    where = ""
    for name in filter_doc:
        if filter_doc[name]:
            value = filter_doc[name]
            condition = "="
            if value.find("*") >= 0:
                value = value.replace("*","%")
                condition = "like"

            expr = ""
            if name != "search":
                expr = name + " " + condition + " " + frappe.db.escape(str(value))

                if where:
                    where += " and "
                where += " " + expr

    if search_expr:
        if where:
            where += " and "
        where += "( " + search_expr + " )"


    sql = "select * from `tab" + doctype + "` "
    if where:
        sql += " where "  + where
    sql += " order by " + sort_by + " limit " + str(page_size)
    res = frappe.db.sql(sql,as_dict=True)
    return { 'uri' : 0, 'info' : '', 'result' : res }

@frappe.whitelist()
def chart_query(query_id,filter):

    if not frappe.db.exists('bpcrm_chart',query_id):
        frappe.throw(_("Chart definition does not exist"))

    chart_dc = frappe.get_doc('bpcrm_chart',query_id)

    try:
        filter_doc = json.loads(filter)
    except:
        frappe.throw(_("Cannot unserialize filter data"))

    page_size = filter_doc['page_size']
    if not page_size:
        page_size = 20

    sort_direction = filter_doc['sort_direction']
    sort_by = filter_doc['sort_by']

    if not sort_by:
        sort_by = "name"

    if sort_direction == "Descending":
        sort_by += " desc "
    del(filter_doc['page_size'])
    del(filter_doc['sort_direction'])
    del(filter_doc['sort_by'])

    search_expr = ""
    if filter_doc['search']:
        condition = "="
        value = filter_doc['search']
        if value.find("*") >= 0:
            value = value.replace("*","%")
            condition = "like"

        search_fields = json.loads(search)
        for i in range(len(search_fields)):
            if search_expr:
                search_expr += " or "
            search_expr += search_fields[i] + " " + condition + " " + frappe.db.escape(str(value))

    where = ""
    for name in filter_doc:
        if filter_doc[name]:
            value = filter_doc[name]
            condition = "="
            if value.find("*") >= 0:
                value = value.replace("*","%")
                condition = "like"

            expr = ""
            if name != "search":
                expr = name + " " + condition + " " + frappe.db.escape(str(value))

                if where:
                    where += " and "
                where += " " + expr

    if search_expr:
        if where:
            where += " and "
        where += "( " + search_expr + " )"

    sql = chart_dc.query
    sql = sql.replace("{{ where }}",where)
    sql = sql.replace("{{ order }}",sort_by)
    sql = sql.replace("{{ page_size }}",str(page_size))

    res = frappe.db.sql(sql,as_dict=True)
    result = {
            'x_axis'    : chart_dc.x_axis,
            'y_axis'    : chart_dc.y_axis,
            'title'     : chart_dc.title,
            'type'      : chart_dc.type,
            'color'     : chart_dc.color,
            'height'    : chart_dc.height,
            'width'     : chart_dc.width,
            'data'      : res 
            }
    return { 'uri' : 0, 'info' : '', 'result' : result }


