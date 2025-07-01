import frappe
from frappe import _

@frappe.whitelist()
def create_Virtual_world():
    """
    Create a new machine record in the LMS.
    """
    try:
        # Check if a machine already exists for the user
        existing_machine = frappe.get_all("Machine", filters={"user": frappe.session.user}, limit=1)
        if existing_machine:
            return {"error": "Machine already exists for this user"}
        machine = frappe.get_doc({
            "doctype": "Machine",
            "user": frappe.session.user,
            "status": "Created"
        })
        machine.insert()
        return {"message": "Machine created successfully", "machine_name": machine.machine_name}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error creating machine")
        return {"error": str(e)}


@frappe.whitelist()
def update_Virtual_world(status):
    
    try:
        machine = frappe.get_doc("Machine", {"user": frappe.session.user})
        machine.status = status
        machine.save()
        return {"message": "Machine updated successfully", "machine_name": machine.machine_name}
    except frappe.DoesNotExistError:
        return {"error": "Machine not found"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error updating machine")
        return {"error": str(e)}
    






@frappe.whitelist()
def create_machine():
    print("Creating machine, \n\n\n\n\n\n\n")
    """
    Create a new machine record in the LMS.
    """
    try:
        # Check if a machine already exists for the user
        existing_machine = frappe.get_all("machine ram", filters={"user": frappe.session.user}, limit=1)
        if existing_machine:
            return {"error": "Machine already exists for this user"}
        machine = frappe.get_doc({
            "doctype": "machine ram",
            "user": frappe.session.user,
        })
        machine.insert()
        return {"message": "Machine created successfully"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error creating machine")
        return {"error": str(e)}


@frappe.whitelist()
def update_machine(status):
    
    try:
        machine = frappe.get_doc("machine ram", {"user": frappe.session.user})
        machine.status = status
        machine.save()
        return {"message": "Machine updated successfully"}
    except frappe.DoesNotExistError:
        return {"error": "Machine not found"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error updating machine")
        return {"error": str(e)}
from frappe import _


@frappe.whitelist()
def assign_user_role(email, role):
    user = frappe.get_doc("User", email)
    if not any(r.role == role for r in user.roles):
        user.append("roles", {"role": role})
        user.save()
