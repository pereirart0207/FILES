using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace afich
{
    public partial class Form1 : Form
    {
        private System.Windows.Forms.Timer autoClockTimer;
        private BindingSource bindingSource = new BindingSource();
        private List<Employee> list = new List<Employee>();
        private string EmployeeFile = "employees.conf";

        public Form1()
        {
            InitializeComponent();
            StartAutoClock();
            lbProgramming.DataSource = bindingSource;
            lbProgramming.DisplayMember = nameof(Employee.ToString);
        }

        private void StartAutoClock()
        {
            autoClockTimer = new System.Windows.Forms.Timer();
            autoClockTimer.Interval = 60 * 1000;
            autoClockTimer.Tick += AutoClockTimer_Tick;
            autoClockTimer.Start();
        }

        private async void AutoClockTimer_Tick(object sender, EventArgs e)
        {
            try
            {
                Scheduler scheduler = new Scheduler();
                await scheduler.ClockEmployeesIfTime(ClockType.Both);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error automatic clock: " + ex.Message);
            }
        }

        private void btnOK_Click(object sender, EventArgs e)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(tbEmployeeName.Text) ||
                    string.IsNullOrWhiteSpace(tbEnterpriseID.Text) ||
                    string.IsNullOrWhiteSpace(tbEmployeeID.Text))
                {
                    MessageBox.Show("Todos los campos son obligatorios.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                List<DayOfWeek> selectedDays = new List<DayOfWeek>();
                if (cb1.Checked) selectedDays.Add(DayOfWeek.Monday);
                if (cb2.Checked) selectedDays.Add(DayOfWeek.Tuesday);
                if (cb3.Checked) selectedDays.Add(DayOfWeek.Wednesday);
                if (cb4.Checked) selectedDays.Add(DayOfWeek.Thursday);
                if (cb5.Checked) selectedDays.Add(DayOfWeek.Friday);
                if (cb6.Checked) selectedDays.Add(DayOfWeek.Saturday);
                if (cb7.Checked) selectedDays.Add(DayOfWeek.Sunday);

                if (selectedDays.Count == 0)
                {
                    MessageBox.Show("Debe seleccionar al menos un día de la semana.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                TimeOnly exitTime = TimeOnly.FromDateTime(dtpOutTime.Value);

                Employee emp = new Employee(tbEmployeeName.Text.Trim(), tbEnterpriseID.Text.Trim(), tbEmployeeID.Text.Trim())
                {
                    ExitTime = exitTime,
                    DaysOfWeek = selectedDays
                };

                if (emp.Register())
                {
                    list.Add(emp);
                    RefreshEmployeeList();
                    MessageBox.Show("Empleado registrado correctamente.", "Éxito", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }

                tbEmployeeName.Clear();
                tbEnterpriseID.Clear();
                tbEmployeeID.Clear();
                dtpOutTime.Value = DateTime.Now;
                cb1.Checked = cb2.Checked = cb3.Checked = cb4.Checked = cb5.Checked = cb6.Checked = cb7.Checked = false;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error inesperado: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void RefreshEmployeeList()
        {
            bindingSource.DataSource = null;
            bindingSource.DataSource = list;
        }

        private void Form1_Activated(object sender, EventArgs e)
        {
            try
            {
                list = Employee.LoadAllEmployees();
                RefreshEmployeeList();
                LoadPastProgramFiles();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error cargando empleados: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public void ResetData()
        {
            try
            {
                if (File.Exists(EmployeeFile))
                {
                    string directory = Path.GetDirectoryName(EmployeeFile);
                    if (string.IsNullOrEmpty(directory))
                        directory = ".";

                    string baseFileName = Path.GetFileNameWithoutExtension(EmployeeFile);
                    string extension = Path.GetExtension(EmployeeFile);
                    var existingFiles = Directory.GetFiles(directory, $"{baseFileName}_semana*.conf");
                    int count = existingFiles.Length + 1;
                    string newFileName = Path.Combine(directory, $"{baseFileName}_semana{count}{extension}");
                    File.Move(EmployeeFile, newFileName);

                    MessageBox.Show($"Archivo renombrado a {newFileName}", "Éxito", MessageBoxButtons.OK, MessageBoxIcon.Information);

                    list.Clear();
                    RefreshEmployeeList();
                }
                else
                {
                    MessageBox.Show("No existe el archivo de empleados para renombrar.", "Información", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error renombrando el archivo: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void deleteAll_Click(object sender, EventArgs e)
        {
            ResetData();
        }

        private void btnDelSelected_Click(object sender, EventArgs e)
        {
            if (lbProgramming.SelectedItem is Employee emp)
            {
                emp.Delete();
                list.Remove(emp);
                RefreshEmployeeList();
            }
            else
            {
                MessageBox.Show("No se pudo identificar al empleado seleccionado.");
            }
        }

        private void LoadPastProgramFiles()
        {
            cbLastPrograming.Items.Clear();
            cbLastPrograming.SelectedIndex = -1;

            string directory = Path.GetDirectoryName(EmployeeFile);
            if (string.IsNullOrEmpty(directory))
                directory = ".";

            string baseFileName = Path.GetFileNameWithoutExtension(EmployeeFile);
            string extension = Path.GetExtension(EmployeeFile);
            var files = Directory.GetFiles(directory, $"{baseFileName}_semana*.conf");

            foreach (var file in files)
            {
                cbLastPrograming.Items.Add(Path.GetFileName(file));
            }

            cbLastPrograming.Text = "Selecciona una programación...";
        }

        private void cbLastPrograming_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cbLastPrograming.SelectedItem == null) return;

            string selectedFile = cbLastPrograming.SelectedItem.ToString();
            string directory = Path.GetDirectoryName(EmployeeFile);
            if (string.IsNullOrEmpty(directory))
                directory = ".";

            string selectedPath = Path.Combine(directory, selectedFile);
            string destinationPath = Path.Combine(directory, "employees.conf");

            try
            {
                File.Copy(selectedPath, destinationPath, overwrite: true);
                MessageBox.Show($"Programación restaurada desde {selectedFile}", "Restaurado", MessageBoxButtons.OK, MessageBoxIcon.Information);
                Form1_Activated(null, null);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al restaurar: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void lbProgramming_DoubleClick(object sender, EventArgs e)
        {
            if (lbProgramming.SelectedItem is Employee emp)
            {
                tbEmployeeID.Text = emp.EmployeeId;
                tbEmployeeName.Text = emp.Name;
                tbEnterpriseID.Text = emp.EnterpriseId;

                // Cargar la hora de salida en el DateTimePicker
                //dtpOutTime.Value = DateTime.Today.Add(emp.ExitTime.ToTimeSpan());

                // Desmarcar todos los CheckBoxes
                cb1.Checked = cb2.Checked = cb3.Checked = cb4.Checked = cb5.Checked = cb6.Checked = cb7.Checked = false;

                // Marcar los días que están en la lista del empleado
                foreach (DayOfWeek day in emp.DaysOfWeek)
                {
                    switch (day)
                    {
                        case DayOfWeek.Monday: cb1.Checked = true; break;
                        case DayOfWeek.Tuesday: cb2.Checked = true; break;
                        case DayOfWeek.Wednesday: cb3.Checked = true; break;
                        case DayOfWeek.Thursday: cb4.Checked = true; break;
                        case DayOfWeek.Friday: cb5.Checked = true; break;
                        case DayOfWeek.Saturday: cb6.Checked = true; break;
                        case DayOfWeek.Sunday: cb7.Checked = true; break;
                    }
                }

                RefreshEmployeeList();
            }
            else
            {
                MessageBox.Show("No se pudo identificar al empleado seleccionado.");
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            dtpOutTime.Format = DateTimePickerFormat.Custom;
            dtpOutTime.CustomFormat = "HH:mm";
        }
    }
}