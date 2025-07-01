using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace afich
{
    internal class Files
    {

      

        public List<Employee> ReadAllEmployees(string filePath = "employees.conf")
        {
            List<Employee> employees = new List<Employee>();

            if (!File.Exists(filePath))
                return employees;

            string[] lines = File.ReadAllLines(filePath);
            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                string[] parts = line.Split('|');
                if (parts.Length >= 3)
                {
                    string name = parts[0];
                    string enterpriseId = parts[1];
                    string employeeId = parts[2];

                    TimeOnly? horaEntrada = null;
                    TimeOnly? horaSalida = null;

                    if (parts.Length > 3 && TimeOnly.TryParseExact(parts[3], "HH:mm", null, DateTimeStyles.None, out TimeOnly entrada))
                        horaEntrada = entrada;

                    if (parts.Length > 4 && TimeOnly.TryParseExact(parts[4], "HH:mm", null, DateTimeStyles.None, out TimeOnly salida))
                        horaSalida = salida;

                    List<DayOfWeek> daysOfWeek = new List<DayOfWeek>();
                    if (parts.Length > 5)
                    {
                        string[] daysStrings = parts[5].Split(',', StringSplitOptions.RemoveEmptyEntries);
                        foreach (var dayStr in daysStrings)
                        {
                            if (TryParseDayOfWeek(dayStr.Trim(), out DayOfWeek day))
                            {
                                daysOfWeek.Add(day);
                            }
                        }
                    }

                    Employee emp = new Employee(name, enterpriseId, employeeId)
                    {
                        EntryTime = horaEntrada,
                        ExitTime = horaSalida,
                        DaysOfWeek = daysOfWeek
                    };

                    employees.Add(emp);
                }
            }

            return employees;
        }

        private bool TryParseDayOfWeek(string dayString, out DayOfWeek day)
        {
            // Intentamos parsear tanto en español como en inglés
            day = DayOfWeek.Monday; // valor por defecto
            var map = new Dictionary<string, DayOfWeek>(StringComparer.OrdinalIgnoreCase)
            {
                {"lunes", DayOfWeek.Monday},
                {"martes", DayOfWeek.Tuesday},
                {"miercoles", DayOfWeek.Wednesday},
                {"miércoles", DayOfWeek.Wednesday},
                {"jueves", DayOfWeek.Thursday},
                {"viernes", DayOfWeek.Friday},
                {"sabado", DayOfWeek.Saturday},
                {"sábado", DayOfWeek.Saturday},
                {"domingo", DayOfWeek.Sunday},

                {"monday", DayOfWeek.Monday},
                {"tuesday", DayOfWeek.Tuesday},
                {"wednesday", DayOfWeek.Wednesday},
                {"thursday", DayOfWeek.Thursday},
                {"friday", DayOfWeek.Friday},
                {"saturday", DayOfWeek.Saturday},
                {"sunday", DayOfWeek.Sunday},
            };

            return map.TryGetValue(dayString.ToLowerInvariant(), out day);
        }
    }
}
