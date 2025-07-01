using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace afich
{
    public class Scheduler
    {
        public async Task ClockEmployeesIfTime(ClockType type)
        {
            Files fileManager = new Files();
            List<Employee> employees = fileManager.ReadAllEmployees();

            TimeOnly now = TimeOnly.FromDateTime(DateTime.Now);
            TimeSpan tolerance = TimeSpan.FromMinutes(5);
            DayOfWeek today = DateTime.Now.DayOfWeek;

            foreach (var emp in employees)
            {
                // Verificar si el empleado debe trabajar hoy
                if (emp.DaysOfWeek != null && emp.DaysOfWeek.Count > 0 && !emp.DaysOfWeek.Contains(today))
                {
                    continue; // Saltar este empleado si hoy no trabaja
                }

                // Clock-in
                if ((type == ClockType.Entry || type == ClockType.Both) &&
                    emp.EntryTime.HasValue)
                {
                    TimeSpan diffEntry = (now.ToTimeSpan() - emp.EntryTime.Value.ToTimeSpan()).Duration();

                    if (diffEntry <= tolerance)
                    {
                        try
                        {
                            await emp.Clock();
                            Console.WriteLine($"Clocked in: {emp.Name}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error clocking in {emp.Name}: {ex.Message}");
                        }
                    }
                }

                // Clock-out
                if ((type == ClockType.Exit || type == ClockType.Both) &&
                    emp.ExitTime.HasValue)
                {
                    TimeSpan diffExit = (now.ToTimeSpan() - emp.ExitTime.Value.ToTimeSpan()).Duration();

                    if (diffExit <= tolerance)
                    {
                        try
                        {
                            await emp.Clock();
                            Console.WriteLine($"Clocked out: {emp.Name}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error clocking out {emp.Name}: {ex.Message}");
                        }
                    }
                }
            }
        }
    }
}
