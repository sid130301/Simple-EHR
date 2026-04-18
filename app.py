from __future__ import annotations

import tkinter as tk
from tkinter import messagebox, ttk

from ehr_data import load_data


class EHRApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Simple EHR - Solo Physician Clinic")
        self.geometry("1440x900")
        self.minsize(1180, 760)
        self.configure(bg="#e8e1d5")

        self.data = load_data()
        self.patient_index = {patient["id"]: patient for patient in self.data["patients"]}
        self.current_patient_id = self.data["patients"][0]["id"]

        self._build_styles()
        self._build_layout()
        self.refresh_all()

    def _build_styles(self) -> None:
        style = ttk.Style(self)
        style.theme_use("clam")

        style.configure("Shell.TFrame", background="#e8e1d5")
        style.configure("Panel.TFrame", background="#f7f2eb")
        style.configure("Card.TFrame", background="#fffdfa")
        style.configure("Sidebar.TFrame", background="#23443d")
        style.configure("Sidebar.TLabel", background="#23443d", foreground="#f6f1e7")
        style.configure("Heading.TLabel", background="#f7f2eb", foreground="#1d2724", font=("Segoe UI", 18, "bold"))
        style.configure("Subheading.TLabel", background="#f7f2eb", foreground="#5d665f", font=("Segoe UI", 10))
        style.configure("CardHeading.TLabel", background="#fffdfa", foreground="#1d2724", font=("Segoe UI", 12, "bold"))
        style.configure("CardBody.TLabel", background="#fffdfa", foreground="#33403a", font=("Segoe UI", 10))
        style.configure("Sidebar.TButton", padding=8, anchor="w")
        style.configure("Nav.TButton", padding=10, anchor="w", font=("Segoe UI", 10, "bold"))

    def _build_layout(self) -> None:
        self.columnconfigure(1, weight=1)
        self.rowconfigure(0, weight=1)

        self.sidebar = ttk.Frame(self, style="Sidebar.TFrame", width=260)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_propagate(False)
        self.sidebar.columnconfigure(0, weight=1)

        self.main = ttk.Frame(self, style="Shell.TFrame")
        self.main.grid(row=0, column=1, sticky="nsew")
        self.main.columnconfigure(0, weight=1)
        self.main.rowconfigure(1, weight=1)

        self._build_sidebar()
        self._build_topbar()
        self._build_content()

    def _build_sidebar(self) -> None:
        ttk.Label(self.sidebar, text="Simple EHR", style="Sidebar.TLabel", font=("Segoe UI", 22, "bold")).grid(
            row=0, column=0, sticky="w", padx=20, pady=(24, 6)
        )
        ttk.Label(
            self.sidebar,
            text="Solo Physician Clinic",
            style="Sidebar.TLabel",
            font=("Segoe UI", 10),
        ).grid(row=1, column=0, sticky="w", padx=20)

        ttk.Separator(self.sidebar).grid(row=2, column=0, sticky="ew", padx=18, pady=18)

        ttk.Label(self.sidebar, text="Patients", style="Sidebar.TLabel", font=("Segoe UI", 11, "bold")).grid(
            row=3, column=0, sticky="w", padx=20, pady=(0, 8)
        )

        self.patient_buttons: dict[str, ttk.Button] = {}
        button_row = 4
        for patient in self.data["patients"]:
            button = ttk.Button(
                self.sidebar,
                text=f'{patient["name"]}\n{patient["reason_for_visit"]}',
                style="Sidebar.TButton",
                command=lambda patient_id=patient["id"]: self.select_patient(patient_id),
            )
            button.grid(row=button_row, column=0, sticky="ew", padx=18, pady=6)
            self.patient_buttons[patient["id"]] = button
            button_row += 1

        ttk.Separator(self.sidebar).grid(row=button_row, column=0, sticky="ew", padx=18, pady=18)
        button_row += 1

        user = self.data["user"]
        ttk.Label(self.sidebar, text=user["name"], style="Sidebar.TLabel", font=("Segoe UI", 11, "bold")).grid(
            row=button_row, column=0, sticky="w", padx=20
        )
        ttk.Label(self.sidebar, text=user["org"], style="Sidebar.TLabel", font=("Segoe UI", 10)).grid(
            row=button_row + 1, column=0, sticky="w", padx=20, pady=(4, 0)
        )

    def _build_topbar(self) -> None:
        topbar = ttk.Frame(self.main, style="Panel.TFrame")
        topbar.grid(row=0, column=0, sticky="ew", padx=18, pady=18)
        topbar.columnconfigure(0, weight=1)

        self.search_var = tk.StringVar(value="Search patients, messages, labs, tasks...")
        search = ttk.Entry(topbar, textvariable=self.search_var, font=("Segoe UI", 11))
        search.grid(row=0, column=0, sticky="ew", padx=(0, 12))

        ttk.Button(topbar, text="Today", command=lambda: self.tabs.select(self.dashboard_tab)).grid(row=0, column=1, padx=6)
        ttk.Button(topbar, text="Open Note", command=lambda: self.tabs.select(self.chart_tab)).grid(row=0, column=2)

    def _build_content(self) -> None:
        content = ttk.Frame(self.main, style="Shell.TFrame")
        content.grid(row=1, column=0, sticky="nsew", padx=18, pady=(0, 18))
        content.columnconfigure(0, weight=1)
        content.rowconfigure(0, weight=1)

        self.tabs = ttk.Notebook(content)
        self.tabs.grid(row=0, column=0, sticky="nsew")

        self.dashboard_tab = ttk.Frame(self.tabs, style="Panel.TFrame")
        self.schedule_tab = ttk.Frame(self.tabs, style="Panel.TFrame")
        self.inbox_tab = ttk.Frame(self.tabs, style="Panel.TFrame")
        self.tasks_tab = ttk.Frame(self.tabs, style="Panel.TFrame")
        self.billing_tab = ttk.Frame(self.tabs, style="Panel.TFrame")
        self.chart_tab = ttk.Frame(self.tabs, style="Panel.TFrame")

        self.tabs.add(self.dashboard_tab, text="Dashboard")
        self.tabs.add(self.schedule_tab, text="Schedule")
        self.tabs.add(self.inbox_tab, text="Inbox")
        self.tabs.add(self.tasks_tab, text="Tasks")
        self.tabs.add(self.billing_tab, text="Billing")
        self.tabs.add(self.chart_tab, text="Patient Chart")

        self._build_dashboard_tab()
        self._build_schedule_tab()
        self._build_inbox_tab()
        self._build_tasks_tab()
        self._build_billing_tab()
        self._build_chart_tab()

    def _build_dashboard_tab(self) -> None:
        self.dashboard_tab.columnconfigure((0, 1, 2), weight=1)

        self.dashboard_intro = self._create_card(self.dashboard_tab, "Daily Clinic Snapshot")
        self.dashboard_intro.grid(row=0, column=0, columnspan=3, sticky="nsew", padx=14, pady=14)
        self.dashboard_intro_body = self._body_label(self.dashboard_intro)

        self.metric_labels = {}
        for index, title in enumerate(("Patients Today", "Ready Now", "Open Tasks")):
            card = self._create_card(self.dashboard_tab, title)
            card.grid(row=1, column=index, sticky="nsew", padx=14, pady=14)
            label = ttk.Label(card, text="", style="CardHeading.TLabel", font=("Segoe UI", 26, "bold"))
            label.pack(anchor="w", pady=(8, 0))
            self.metric_labels[title] = label

        self.today_focus = self._create_card(self.dashboard_tab, "What Needs Attention First")
        self.today_focus.grid(row=2, column=0, columnspan=2, sticky="nsew", padx=14, pady=14)
        self.today_focus_body = self._body_label(self.today_focus)

        self.current_patient = self._create_card(self.dashboard_tab, "Current Patient")
        self.current_patient.grid(row=2, column=2, sticky="nsew", padx=14, pady=14)
        self.current_patient_body = self._body_label(self.current_patient)

    def _build_schedule_tab(self) -> None:
        self.schedule_tab.columnconfigure(0, weight=1)
        card = self._create_card(self.schedule_tab, "Today's Appointments")
        card.grid(row=0, column=0, sticky="nsew", padx=14, pady=14)

        columns = ("time", "patient", "visit_type", "status")
        self.schedule_tree = ttk.Treeview(card, columns=columns, show="headings", height=12)
        for column, heading, width in (
            ("time", "Time", 90),
            ("patient", "Patient", 180),
            ("visit_type", "Visit Type", 220),
            ("status", "Status", 130),
        ):
            self.schedule_tree.heading(column, text=heading)
            self.schedule_tree.column(column, width=width, anchor="w")
        self.schedule_tree.pack(fill="both", expand=True, pady=(10, 0))

    def _build_inbox_tab(self) -> None:
        self.inbox_tab.columnconfigure(0, weight=1)
        self.inbox_tab.columnconfigure(1, weight=2)

        left = self._create_card(self.inbox_tab, "Inbox")
        left.grid(row=0, column=0, sticky="nsew", padx=14, pady=14)
        right = self._create_card(self.inbox_tab, "Selected Item")
        right.grid(row=0, column=1, sticky="nsew", padx=14, pady=14)

        self.inbox_list = tk.Listbox(left, font=("Segoe UI", 10), activestyle="none", height=16)
        self.inbox_list.pack(fill="both", expand=True, pady=(10, 0))
        self.inbox_list.bind("<<ListboxSelect>>", self._on_inbox_selected)

        self.inbox_detail = tk.Text(right, wrap="word", height=16, font=("Segoe UI", 10), bg="#fffdfa", relief="flat")
        self.inbox_detail.pack(fill="both", expand=True, pady=(10, 0))
        self.inbox_detail.configure(state="disabled")

    def _build_tasks_tab(self) -> None:
        self.tasks_tab.columnconfigure(0, weight=1)
        card = self._create_card(self.tasks_tab, "Clinic Follow-up List")
        card.grid(row=0, column=0, sticky="nsew", padx=14, pady=14)

        columns = ("patient", "title", "due", "status")
        self.tasks_tree = ttk.Treeview(card, columns=columns, show="headings", height=12)
        for column, heading, width in (
            ("patient", "Patient", 180),
            ("title", "Task", 330),
            ("due", "Due", 120),
            ("status", "Status", 120),
        ):
            self.tasks_tree.heading(column, text=heading)
            self.tasks_tree.column(column, width=width, anchor="w")
        self.tasks_tree.pack(fill="both", expand=True, pady=(10, 10))

        ttk.Button(card, text="Mark Selected Complete", command=self.complete_selected_task).pack(anchor="e")

    def _build_billing_tab(self) -> None:
        self.billing_tab.columnconfigure(0, weight=1)
        card = self._create_card(self.billing_tab, "Simple Claims And Balances")
        card.grid(row=0, column=0, sticky="nsew", padx=14, pady=14)

        columns = ("patient", "last_claim", "balance", "status")
        self.billing_tree = ttk.Treeview(card, columns=columns, show="headings", height=12)
        for column, heading, width in (
            ("patient", "Patient", 180),
            ("last_claim", "Last Claim", 250),
            ("balance", "Balance", 120),
            ("status", "Status", 180),
        ):
            self.billing_tree.heading(column, text=heading)
            self.billing_tree.column(column, width=width, anchor="w")
        self.billing_tree.pack(fill="both", expand=True, pady=(10, 0))

    def _build_chart_tab(self) -> None:
        self.chart_tab.columnconfigure(0, weight=1)
        self.chart_tab.rowconfigure(1, weight=1)

        header = self._create_card(self.chart_tab, "Patient Chart")
        header.grid(row=0, column=0, sticky="ew", padx=14, pady=14)
        self.chart_header = self._body_label(header)

        notebook_holder = ttk.Frame(self.chart_tab, style="Panel.TFrame")
        notebook_holder.grid(row=1, column=0, sticky="nsew", padx=14, pady=(0, 14))
        notebook_holder.columnconfigure(0, weight=1)
        notebook_holder.rowconfigure(0, weight=1)

        self.chart_notebook = ttk.Notebook(notebook_holder)
        self.chart_notebook.grid(row=0, column=0, sticky="nsew")

        self.overview_frame = ttk.Frame(self.chart_notebook, style="Panel.TFrame")
        self.history_frame = ttk.Frame(self.chart_notebook, style="Panel.TFrame")
        self.note_frame = ttk.Frame(self.chart_notebook, style="Panel.TFrame")
        self.orders_frame = ttk.Frame(self.chart_notebook, style="Panel.TFrame")
        self.messages_frame = ttk.Frame(self.chart_notebook, style="Panel.TFrame")

        self.chart_notebook.add(self.overview_frame, text="Overview")
        self.chart_notebook.add(self.history_frame, text="History")
        self.chart_notebook.add(self.note_frame, text="Visit Note")
        self.chart_notebook.add(self.orders_frame, text="Orders")
        self.chart_notebook.add(self.messages_frame, text="Messages")

        self.overview_text = self._tab_text(self.overview_frame)
        self.history_text = self._tab_text(self.history_frame)
        self.orders_text = self._tab_text(self.orders_frame)
        self.messages_text = self._tab_text(self.messages_frame)

        note_card = self._create_card(self.note_frame, "Assessment And Plan")
        note_card.pack(fill="both", expand=True, padx=10, pady=10)
        ttk.Label(note_card, text="Physician Note", style="CardHeading.TLabel").pack(anchor="w", pady=(8, 4))
        self.note_text = tk.Text(note_card, wrap="word", height=14, font=("Segoe UI", 10), bg="#fffdfa", relief="solid", bd=1)
        self.note_text.pack(fill="both", expand=True)
        ttk.Label(note_card, text="After-Visit Instructions", style="CardHeading.TLabel").pack(anchor="w", pady=(12, 4))
        self.instructions_text = tk.Text(
            note_card, wrap="word", height=7, font=("Segoe UI", 10), bg="#fffdfa", relief="solid", bd=1
        )
        self.instructions_text.pack(fill="both", expand=True)

        actions = ttk.Frame(note_card, style="Card.TFrame")
        actions.pack(fill="x", pady=(12, 0))
        ttk.Button(actions, text="Save Note", command=self.save_note).pack(side="right")

    def _create_card(self, parent: ttk.Frame, title: str) -> ttk.Frame:
        card = ttk.Frame(parent, style="Card.TFrame", padding=16)
        ttk.Label(card, text=title, style="CardHeading.TLabel").pack(anchor="w")
        return card

    def _body_label(self, parent: ttk.Frame) -> ttk.Label:
        label = ttk.Label(parent, text="", style="CardBody.TLabel", justify="left", wraplength=420)
        label.pack(anchor="w", fill="x", pady=(10, 0))
        return label

    def _tab_text(self, parent: ttk.Frame) -> tk.Text:
        card = self._create_card(parent, "")
        card.pack(fill="both", expand=True, padx=10, pady=10)
        text = tk.Text(card, wrap="word", font=("Segoe UI", 10), bg="#fffdfa", relief="flat")
        text.pack(fill="both", expand=True)
        text.configure(state="disabled")
        return text

    def refresh_all(self) -> None:
        self._refresh_dashboard()
        self._refresh_schedule()
        self._refresh_inbox()
        self._refresh_tasks()
        self._refresh_billing()
        self._refresh_chart()

    def _refresh_dashboard(self) -> None:
        ready_now = sum(1 for item in self.data["schedule"] if item["status"] == "Ready")
        open_tasks = sum(1 for item in self.data["tasks"] if item["status"] != "Complete")

        self.dashboard_intro_body.configure(
            text=(
                "A lightweight desktop EHR for one doctor: today's schedule, chart review, "
                "visit notes, messages, orders, and simple billing."
            )
        )
        self.metric_labels["Patients Today"].configure(text=str(len(self.data["schedule"])))
        self.metric_labels["Ready Now"].configure(text=str(ready_now))
        self.metric_labels["Open Tasks"].configure(text=str(open_tasks))

        self.today_focus_body.configure(
            text=(
                "1. Mary Carter needs diabetes follow-up, refill review, and a foot exam.\n"
                "2. Daniel Lopez needs preventive screening and routine labs.\n"
                "3. One copay balance is still due at checkout."
            )
        )

        patient = self.current_patient
        self.current_patient_body.configure(
            text=(
                f'{patient["name"]} - {patient["reason_for_visit"]}\n\n'
                f'{patient["what_matters_now"]}'
            )
        )

    def _refresh_schedule(self) -> None:
        self.schedule_tree.delete(*self.schedule_tree.get_children())
        for item in self.data["schedule"]:
            patient = self.patient_index[item["patient_id"]]
            self.schedule_tree.insert(
                "", "end", values=(item["time"], patient["name"], item["visit_type"], item["status"])
            )

    def _refresh_inbox(self) -> None:
        self.inbox_list.delete(0, tk.END)
        for item in self.data["inbox"]:
            patient = self.patient_index[item["patient_id"]]
            self.inbox_list.insert(tk.END, f'{patient["name"]} - {item["title"]}')
        if self.data["inbox"]:
            self.inbox_list.selection_clear(0, tk.END)
            self.inbox_list.selection_set(0)
            self._show_inbox_item(0)

    def _refresh_tasks(self) -> None:
        self.tasks_tree.delete(*self.tasks_tree.get_children())
        for index, item in enumerate(self.data["tasks"]):
            patient = self.patient_index[item["patient_id"]]
            self.tasks_tree.insert(
                "", "end", iid=str(index), values=(patient["name"], item["title"], item["due"], item["status"])
            )

    def _refresh_billing(self) -> None:
        self.billing_tree.delete(*self.billing_tree.get_children())
        for patient in self.data["patients"]:
            billing = patient["billing"]
            self.billing_tree.insert(
                "",
                "end",
                values=(patient["name"], billing["Last claim"], billing["Balance"], billing["Status"]),
            )

    def _refresh_chart(self) -> None:
        patient = self.current_patient
        self.chart_header.configure(
            text=(
                f'{patient["name"]} | {patient["reason_for_visit"]}\n'
                f'DOB {patient["dob"]} | MRN {patient["mrn"]} | Insurance {patient["insurance"]}'
            )
        )

        overview = (
            f'What matters now:\n{patient["what_matters_now"]}\n\n'
            f'Chart memory:\n{patient["memory"]}\n\n'
            f'Flags:\n- ' + "\n- ".join(patient["flags"]) + "\n\n"
            f'Active problems:\n- ' + "\n- ".join(patient["active_problems"]) + "\n\n"
            f'Allergies:\n- ' + "\n- ".join(patient["allergies"]) + "\n\n"
            f'Metrics:\n' + "\n".join(f"- {label}: {value}" for label, value in patient["metrics"].items()) + "\n\n"
            f'Medications:\n- ' + "\n- ".join(patient["meds"])
        )
        history = "Timeline:\n- " + "\n- ".join(patient["timeline"]) + "\n\nCare goals:\n- " + "\n- ".join(patient["care_goals"])
        orders = "Orders:\n- " + "\n- ".join(patient["orders"]) + "\n\nLabs:\n- " + "\n- ".join(patient["labs"])
        messages = "Messages:\n- " + "\n- ".join(patient["messages"])

        self._set_readonly_text(self.overview_text, overview)
        self._set_readonly_text(self.history_text, history)
        self._set_readonly_text(self.orders_text, orders)
        self._set_readonly_text(self.messages_text, messages)

        self.note_text.delete("1.0", tk.END)
        self.note_text.insert("1.0", patient["visit_note"])
        self.instructions_text.delete("1.0", tk.END)
        self.instructions_text.insert("1.0", patient["instructions"])

        self._highlight_selected_patient_button()

    def _set_readonly_text(self, widget: tk.Text, content: str) -> None:
        widget.configure(state="normal")
        widget.delete("1.0", tk.END)
        widget.insert("1.0", content)
        widget.configure(state="disabled")

    @property
    def current_patient(self) -> dict:
        return self.patient_index[self.current_patient_id]

    def select_patient(self, patient_id: str) -> None:
        self.current_patient_id = patient_id
        self.refresh_all()
        self.tabs.select(self.chart_tab)

    def _highlight_selected_patient_button(self) -> None:
        for patient_id, button in self.patient_buttons.items():
            if patient_id == self.current_patient_id:
                button.configure(text=f'{self.patient_index[patient_id]["name"]}\nOpen Chart')
            else:
                button.configure(
                    text=f'{self.patient_index[patient_id]["name"]}\n{self.patient_index[patient_id]["reason_for_visit"]}'
                )

    def _on_inbox_selected(self, _event: tk.Event) -> None:
        selection = self.inbox_list.curselection()
        if selection:
            self._show_inbox_item(selection[0])

    def _show_inbox_item(self, index: int) -> None:
        item = self.data["inbox"][index]
        patient = self.patient_index[item["patient_id"]]
        self.inbox_detail.configure(state="normal")
        self.inbox_detail.delete("1.0", tk.END)
        self.inbox_detail.insert(
            "1.0",
            f'Patient: {patient["name"]}\n'
            f'Title: {item["title"]}\n\n'
            f'{item["detail"]}\n\n'
            f'Visit: {patient["reason_for_visit"]}\n'
            f'Current focus: {patient["what_matters_now"]}',
        )
        self.inbox_detail.configure(state="disabled")

    def complete_selected_task(self) -> None:
        selected = self.tasks_tree.selection()
        if not selected:
            messagebox.showinfo("Tasks", "Select a task first.")
            return

        task_index = int(selected[0])
        self.data["tasks"][task_index]["status"] = "Complete"
        self.refresh_all()

    def save_note(self) -> None:
        patient = self.current_patient
        patient["visit_note"] = self.note_text.get("1.0", tk.END).strip()
        patient["instructions"] = self.instructions_text.get("1.0", tk.END).strip()
        messagebox.showinfo("Visit Note", f'Note saved for {patient["name"]}.')


def main() -> None:
    app = EHRApp()
    app.mainloop()


if __name__ == "__main__":
    main()
