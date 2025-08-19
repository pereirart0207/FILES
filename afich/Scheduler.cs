using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace afich
{
    public class Scheduler
    {
        private readonly string logFile = "fichajes.log";
        private readonly TimeSpan tolerance = TimeSpan.FromMinutes(5);

        public async Task ClockEmployeesIfTime(ClockType type)
        {
            Files fileManager = new Files();
            List<Employee> employees = fileManager.ReadAllEmployees();

            TimeOnly now = TimeOnly.FromDateTime(DateTime.Now);
            DayOfWeek today = DateTime.Now.DayOfWeek;

            // Cargar fichajes ya realizados hoy (sin importar tipo)
            var alreadyClockedToday = LoadTodayClocked();

            foreach (var emp in employees)
            {
                if (emp.DaysOfWeek != null && emp.DaysOfWeek.Count > 0 && !emp.DaysOfWeek.Contains(today))
                    continue;

                bool shouldClock = false;

                // Evaluar entrada
                if ((type == ClockType.Entry || type == ClockType.Both) &&
                    emp.EntryTime.HasValue &&
                    now >= emp.EntryTime.Value &&
                    now <= emp.EntryTime.Value.Add(tolerance))
                {
                    shouldClock = true;
                }

                // Evaluar salida
                if ((type == ClockType.Exit || type == ClockType.Both) &&
                    emp.ExitTime.HasValue &&
                    now >= emp.ExitTime.Value &&
                    now <= emp.ExitTime.Value.Add(tolerance))
                {
                    shouldClock = true;
                }

                if (shouldClock && !alreadyClockedToday.Contains(emp.EmployeeId))
                {
                    try
                    {
                        await emp.Clock();
                        SaveClocked(emp.EmployeeId);
                        Console.WriteLine($"Clocked: {emp.Name}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error clocking {emp.Name}: {ex.Message}");
                    }
                }
            }
        }

        private HashSet<string> LoadTodayClocked()
        {
            string today = DateTime.Today.ToString("yyyy-MM-dd");

            if (!File.Exists(logFile))
                return new HashSet<string>();

            return new HashSet<string>(
                File.ReadAllLines(logFile)
                    .Where(line => line.StartsWith($"{today};"))
                    .Select(line => line.Split(';')[1]) // emp.EmployeeId
            );
        }

        private void SaveClocked(string empId)
        {
            string today = DateTime.Today.ToString("yyyy-MM-dd");
            string time = DateTime.Now.ToString("HH:mm:ss");
            File.AppendAllLines(logFile, new[] { $"{today};{empId};{time}" });
        }
    }
}
