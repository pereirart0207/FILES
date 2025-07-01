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
        List<Employee> list = new List<Employee>();
        string EmployeeFile = "employees.conf";

        public Form1()
        {
            InitializeComponent();
            StartAutoClock();
        }

        private void StartAutoClock()
        {
            autoClockTimer = new System.Windows.Forms.Timer();
            autoClockTimer.Interval = 60 * 1000; // 1 minuto
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
                // Validaciones
                if (string.IsNullOrWhiteSpace(tbEmployeeName.Text))
                {
                    MessageBox.Show("El nombre del empleado no puede estar vacío.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    tbEmployeeName.Focus();
                    return;
                }

                if (string.IsNullOrWhiteSpace(tbEnterpriseID.Text))
                {
                    MessageBox.Show("El ID de la empresa no puede estar vacío.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    tbEnterpriseID.Focus();
                    return;
                }

                if (string.IsNullOrWhiteSpace(tbEmployeeID.Text))
                {
                    MessageBox.Show("El ID del empleado no puede estar vacío.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    tbEmployeeID.Focus();
                    return;
                }

                // Obtener los días seleccionados de los checkbox
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

                // Convertir la hora seleccionada a TimeOnly
                TimeOnly exitTime = TimeOnly.FromDateTime(dtpOutTime.Value);

                // Crear y registrar empleado
                Employee emp = new Employee(tbEmployeeName.Text.Trim(), tbEnterpriseID.Text.Trim(), tbEmployeeID.Text.Trim())
                {
                    ExitTime = exitTime,
                    DaysOfWeek = selectedDays
                };

                emp.Register();
                list.Add(emp);

                MessageBox.Show("Empleado registrado correctamente.", "Éxito", MessageBoxButtons.OK, MessageBoxIcon.Information);

                // Limpiar campos
                tbEmployeeName.Clear();
                tbEnterpriseID.Clear();
                tbEmployeeID.Clear();
                dtpOutTime.Value = DateTime.Now;

                // Limpiar checkboxes
                cb1.Checked = false;
                cb2.Checked = false;
                cb3.Checked = false;
                cb4.Checked = false;
                cb5.Checked = false;
                cb6.Checked = false;
                cb7.Checked = false;

                // Actualizar ListBox
                RefreshEmployeeList();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error inesperado: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void RefreshEmployeeList()
        {
            lbProgramming.Items.Clear();
            foreach (var emp in list)
            {
                string exit = emp.ExitTime.HasValue
                    ? emp.ExitTime.Value.ToString("HH:mm", CultureInfo.InvariantCulture)
                    : "N/A";

                string days = emp.DaysOfWeek != null && emp.DaysOfWeek.Count > 0
                    ? string.Join(", ", emp.DaysOfWeek)
                    : "No días asignados";

                string displayText = $"{emp.Name} | {exit} | Días: {days}";
                lbProgramming.Items.Add(displayText);
            }
        }

        private void Form1_Activated(object sender, EventArgs e)
        {
            try
            {
                list = ReadEmployeesFromFile(EmployeeFile);
                RefreshEmployeeList();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error cargando empleados: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        List<Employee> ReadEmployeesFromFile(string filename)
        {
            var employees = new List<Employee>();

            if (!File.Exists(filename))
                return employees;

            foreach (var line in File.ReadAllLines(filename))
            {
                var parts = line.Split('|');
                if (parts.Length < 6) continue; // Aseguramos que haya campo para días

                string name = parts[0];
                string enterpriseId = parts[1];
                string employeeId = parts[2];

                TimeOnly? entryTime = ParseTimeOnly(parts[3]);
                TimeOnly? exitTime = ParseTimeOnly(parts[4]);

                List<DayOfWeek> daysOfWeek = new List<DayOfWeek>();
                string daysStr = parts[5];
                if (!string.IsNullOrWhiteSpace(daysStr))
                {
                    var daysStrings = daysStr.Split(',', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var d in daysStrings)
                    {
                        if (Enum.TryParse<DayOfWeek>(d.Trim(), out var day))
                        {
                            daysOfWeek.Add(day);
                        }
                    }
                }

                Employee emp = new Employee(name, enterpriseId, employeeId)
                {
                    EntryTime = entryTime,
                    ExitTime = exitTime,
                    DaysOfWeek = daysOfWeek
                };

                employees.Add(emp);
            }

            return employees;
        }

        private TimeOnly? ParseTimeOnly(string timeStr)
        {
            if (TimeOnly.TryParseExact(timeStr, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out TimeOnly time))
            {
                return time;
            }
            return null;
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            // Si quieres que cargue empleados al abrir, llama aquí Form1_Activated(null, null);
        }


        /*public void ResetData()
        {
            try
            {
                if (File.Exists(EmployeeFile))
                {
                    File.Delete(EmployeeFile);
                    MessageBox.Show("Archivo de empleados eliminado correctamente.", "Éxito", MessageBoxButtons.OK, MessageBoxIcon.Information);

                    // Limpia la lista y la interfaz
                    list.Clear();
                    lbProgramming.Items.Clear();
                }
                else
                {
                    MessageBox.Show("No existe el archivo de empleados para eliminar.", "Información", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error eliminando el archivo: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        */

        public void ResetData()
        {
            try
            {
                if (File.Exists(EmployeeFile))
                {
                    string directory = Path.GetDirectoryName(EmployeeFile);
                    if (string.IsNullOrEmpty(directory))
                        directory = "."; // Carpeta actual

                    string baseFileName = Path.GetFileNameWithoutExtension(EmployeeFile); // "employees"
                    string extension = Path.GetExtension(EmployeeFile); // ".conf"

                    // Buscar archivos que coincidan con el patrón "employees_semanaX.conf"
                    var existingFiles = Directory.GetFiles(directory, $"{baseFileName}_semana*.conf");

                    // Contar cuántos ya existen y generar el nuevo nombre
                    int count = existingFiles.Length + 1;

                    string newFileName = Path.Combine(directory, $"{baseFileName}_semana{count}{extension}");

                    File.Move(EmployeeFile, newFileName);

                    MessageBox.Show($"Archivo renombrado a {newFileName}", "Éxito", MessageBoxButtons.OK, MessageBoxIcon.Information);

                    // Limpia la lista y la interfaz
                    list.Clear();
                    lbProgramming.Items.Clear();
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
            if (lbProgramming.SelectedItem != null)
            {
                Employee emp = lbProgramming.SelectedItem as Employee;
                emp.Delete();

            }
            else {
                MessageBox.Show("No hay inguna línea seleccionada para eliminar");
            }

        }
    }
}
