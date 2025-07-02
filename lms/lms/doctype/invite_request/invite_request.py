# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import json

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils.password import get_decrypted_password
from lms.api import assign_user_role



class InviteRequest(Document):
	def on_update(self):
		if (
			self.has_value_changed("status")
			and self.status == "Approved"
			and not frappe.flags.in_test
		):
			self.send_email()

	def create_user(self, password):
		full_name_split = self.full_name.split(" ")
		user = frappe.get_doc(
			{
				"doctype": "User",
				"email": self.signup_email,
				"first_name": full_name_split[0],
				"last_name": full_name_split[1] if len(full_name_split) > 1 else "",
				"username": self.username,
				"send_welcome_email": 0,
				"user_type": "Website User",
				"new_password": password,
			}
		)
		user.save(ignore_permissions=True)
		return user

	def send_email(self):
		site_name = "Mon.School"
		subject = _("Welcome to {0}!").format(site_name)

		args = {
			"full_name": self.full_name,
			"signup_form_link": f"/new-sign-up?invite_code={self.name}",
			"site_name": site_name,
			"site_url": frappe.utils.get_url(),
		}
		frappe.sendmail(
			recipients=self.invite_email,
			subject=subject,
			header=[subject, "green"],
			template="lms_invite_request_approved",
			args=args,
			now=True,
		)


@frappe.whitelist(allow_guest=True)
def create_invite_request(invite_email):

	if not frappe.utils.validate_email_address(invite_email):
		return "invalid email"

	if frappe.db.exists("User", invite_email):
		return "user"

	if frappe.db.exists("Invite Request", {"invite_email": invite_email}):
		return "invite"

	frappe.get_doc(
		{"doctype": "Invite Request", "invite_email": invite_email, "status": "Approved"}
	).save(ignore_permissions=True)
	return "OK"

@frappe.whitelist(allow_guest=True)
def update_invite(data):
	data = frappe._dict(json.loads(data)) if isinstance(data, str) else frappe._dict(data)

	if frappe.db.exists("User", data.signup_email):
		frappe.throw(_("A user with this email already exists."))

	# ✅ Extract role (default to "Website User")
	user_role = data.get("user_role") or "Website User"

	# 🚪 Invite-based flow
	if data.get("invite_code"):
		try:
			doc = frappe.get_doc("Invite Request", data.invite_code)

			doc.signup_email = data.signup_email
			doc.username = data.username
			doc.full_name = data.full_name
			doc.invite_code = data.invite_code
			doc.save(ignore_permissions=True)

			user = doc.create_user(data.password)

			if user:
				assign_user_role(user, user_role)
				doc.status = "Registered"
				doc.save(ignore_permissions=True)

			return "OK"
		except frappe.DoesNotExistError:
			frappe.throw(_("Invalid Invite Code."))

	# 🌐 Open signup flow (no invite code)
	else:
		full_name_split = data.full_name.split(" ")
		user = frappe.get_doc({
			"doctype": "User",
			"email": data.signup_email,
			"first_name": full_name_split[0],
			"last_name": full_name_split[1] if len(full_name_split) > 1 else "",
			"username": data.username,
			"user_type": "Website User",
			"new_password": data.password,
			"send_welcome_email": 1,
		})
		user.insert(ignore_permissions=True)
		assign_user_role(user, user_role)
		return "OK"
