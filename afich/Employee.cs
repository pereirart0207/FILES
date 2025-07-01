using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace afich
{
    public class Employee
    {
        public string Name { get; set; }
        public string EnterpriseId { get; set; }
        public string EmployeeId { get; set; }
        public TimeOnly? EntryTime { get; set; }
        public TimeOnly? ExitTime { get; set; }
        public List<DayOfWeek> DaysOfWeek { get; set; } = new List<DayOfWeek>();

        private static readonly string filePath = "employees.conf";

        public Employee(string name, string enterpriseId, string employeeId)
        {
            Name = name;
            EnterpriseId = enterpriseId;
            EmployeeId = employeeId;
        }

        // Intenta registrar. Devuelve true si OK, false si hay conflicto días con mismo ID.
        public bool Register()
        {
            var existingEmployees = LoadAllEmployees();

            // Buscar empleados con el mismo EmployeeId
            var sameIdEmployees = existingEmployees.FindAll(e => e.EmployeeId == this.EmployeeId);

            foreach (var emp in sameIdEmployees)
            {
                // Verificar si hay días coincidentes
                if (emp.DaysOfWeek.Intersect(this.DaysOfWeek).Any())
                {
                    MessageBox.Show($"No se puede registrar: el ID {EmployeeId} ya está registrado en días coincidentes.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return false;
                }
            }

            // No hay conflicto, se registra
            string line = EmployeeLine();
            File.AppendAllText(filePath, line + Environment.NewLine);
            return true;
        }

        public void Edit(string newName = "")
        {
            if (!File.Exists(filePath))
                return;

            string[] lines = File.ReadAllLines(filePath);
            for (int i = 0; i < lines.Length; i++)
            {
                var parts = lines[i].Split('|');
                if (parts.Length >= 3 && parts[2] == EmployeeId)
                {
                    string name = string.IsNullOrWhiteSpace(newName) ? Name : newName;
                    string entradaStr = EntryTime?.ToString("HH:mm") ?? "";
                    string salidaStr = ExitTime?.ToString("HH:mm") ?? "";
                    string daysStr = DaysOfWeekToString(DaysOfWeek);

                    lines[i] = $"{name}|{EnterpriseId}|{EmployeeId}|{entradaStr}|{salidaStr}|{daysStr}";
                    break;
                }
            }

            File.WriteAllLines(filePath, lines);
        }

        public string EmployeeLine()
        {
            string entradaStr = EntryTime?.ToString("HH:mm") ?? "";
            string salidaStr = ExitTime?.ToString("HH:mm") ?? "";
            string daysStr = DaysOfWeekToString(DaysOfWeek);
            return $"{Name}|{EnterpriseId}|{EmployeeId}|{entradaStr}|{salidaStr}|{daysStr}";
        }

        private static string DaysOfWeekToString(List<DayOfWeek> days)
        {
            if (days == null || days.Count == 0)
                return "";

            return string.Join(",", days);
        }

        public static List<DayOfWeek> StringToDaysOfWeek(string daysStr)
        {
            var result = new List<DayOfWeek>();

            if (string.IsNullOrWhiteSpace(daysStr))
                return result;

            string[] parts = daysStr.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                if (Enum.TryParse(part.Trim(), out DayOfWeek day))
                {
                    result.Add(day);
                }
            }

            return result;
        }

        public async Task Clock()
        {
            DayOfWeek today = DateTime.Now.DayOfWeek;
            if (DaysOfWeek.Count > 0 && !DaysOfWeek.Contains(today))
            {
                return; // Hoy no trabaja
            }

            string authorization = MakeAuthorization();

            using (HttpClient client = new HttpClient())
            {
                try
                {
                    string url = "https://gestion.yafiche.com/v1/webapi/read_data";
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("*/*"));
                    client.DefaultRequestHeaders.Add("Authorization", $"Basic {authorization}");

                    HttpResponseMessage response = await client.PostAsync(url, null);
                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Error al conectar con el servidor.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }

                    string responseData = await response.Content.ReadAsStringAsync();
                    if (responseData == "error")
                        throw new Exception("No se ha encontrado al trabajador en la web");

                    ApiResponse apiResponse = JsonConvert.DeserializeObject<ApiResponse>(responseData);
                    if (apiResponse == null)
                        throw new Exception("Respuesta no válida del servidor");

                    string operation = apiResponse.description.Split(':')[0].Trim().ToLower();
                    TimeOnly now = TimeOnly.FromDateTime(DateTime.Now);

                    if (operation.Contains("entrada"))
                        EntryTime = now;
                    else if (operation.Contains("salida"))
                        ExitTime = now;

                    Edit();

                    MessageBox.Show($"{operation.ToUpper()}\n{apiResponse.employee}", "OPERACIÓN EXITOSA", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    throw;
                }
            }
        }

        public string MakeAuthorization()
        {
            try
            {
                string input = $"{EnterpriseId}:{EmployeeId}";
                byte[] inputBytes = Encoding.UTF8.GetBytes(input);
                return Convert.ToBase64String(inputBytes);
            }
            catch (Exception e)
            {
                MessageBox.Show(e.Message, "Error generando la autorización");
                return string.Empty;
            }
        }

        private class ApiResponse
        {
            public string description { get; set; }
            public string employee { get; set; }
        }

        public override string ToString()
        {
            string salida = ExitTime?.ToString("HH:mm") ?? "N/A";

            string diasTrabajo = DaysOfWeek == null || DaysOfWeek.Count == 0
                ? "Todos los días"
                : string.Join(", ", DaysOfWeek);

            return $"{Name} --- {salida} --- Días: {diasTrabajo}";
        }

        public static Employee ParseFromLine(string line)
        {
            var parts = line.Split('|');
            if (parts.Length < 5)
                throw new FormatException("Línea mal formada.");

            string name = parts[0];
            string enterpriseId = parts[1];
            string employeeId = parts[2];
            TimeOnly? entryTime = null;
            TimeOnly? exitTime = null;
            List<DayOfWeek> days = new List<DayOfWeek>();

            if (parts.Length > 3 && TimeOnly.TryParseExact(parts[3], "HH:mm", null, DateTimeStyles.None, out TimeOnly eTime))
                entryTime = eTime;

            if (parts.Length > 4 && TimeOnly.TryParseExact(parts[4], "HH:mm", null, DateTimeStyles.None, out TimeOnly xTime))
                exitTime = xTime;

            if (parts.Length > 5)
                days = StringToDaysOfWeek(parts[5]);

            var emp = new Employee(name, enterpriseId, employeeId)
            {
                EntryTime = entryTime,
                ExitTime = exitTime,
                DaysOfWeek = days
            };

            return emp;
        }


        public void Delete()
        {
            if (!File.Exists(filePath))
                return;

            var lines = File.ReadAllLines(filePath).ToList();
            string thisLine = EmployeeLine();

            // Buscar la línea exacta y eliminarla
            for (int i = 0; i < lines.Count; i++)
            {
                if (lines[i].Equals(thisLine, StringComparison.OrdinalIgnoreCase))
                {
                    lines.RemoveAt(i);
                    break;
                }
            }

            File.WriteAllLines(filePath, lines);
            MessageBox.Show("Línea Eliminada");
        }

        public static List<Employee> LoadAllEmployees()
        {
            var employees = new List<Employee>();
            if (!File.Exists(filePath)) return employees;

            foreach (var line in File.ReadAllLines(filePath))
            {
                try
                {
                    employees.Add(ParseFromLine(line));
                }
                catch
                {
                    // Ignorar líneas mal formadas
                }
            }
            return employees;
        }
    }
}
