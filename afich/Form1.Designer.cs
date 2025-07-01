namespace afich
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            tbEmployeeName = new TextBox();
            tbEnterpriseID = new TextBox();
            dtpOutTime = new DateTimePicker();
            tbEmployeeID = new TextBox();
            btnOK = new Button();
            label1 = new Label();
            lb1 = new Label();
            label4 = new Label();
            label5 = new Label();
            lbProgramming = new ListBox();
            label6 = new Label();
            btnDel = new Button();
            cb1 = new CheckBox();
            cb2 = new CheckBox();
            cb3 = new CheckBox();
            cb4 = new CheckBox();
            cb5 = new CheckBox();
            cb6 = new CheckBox();
            cb7 = new CheckBox();
            deleteAll = new Button();
            btnDelSelected = new Button();
            cbLastPrograming = new ComboBox();
            SuspendLayout();
            // 
            // tbEmployeeName
            // 
            tbEmployeeName.Location = new Point(12, 23);
            tbEmployeeName.Name = "tbEmployeeName";
            tbEmployeeName.Size = new Size(226, 23);
            tbEmployeeName.TabIndex = 0;
            // 
            // tbEnterpriseID
            // 
            tbEnterpriseID.Location = new Point(12, 73);
            tbEnterpriseID.Name = "tbEnterpriseID";
            tbEnterpriseID.Size = new Size(126, 23);
            tbEnterpriseID.TabIndex = 3;
            // 
            // dtpOutTime
            // 
            dtpOutTime.Format = DateTimePickerFormat.Time;
            dtpOutTime.Location = new Point(159, 73);
            dtpOutTime.Name = "dtpOutTime";
            dtpOutTime.Size = new Size(144, 23);
            dtpOutTime.TabIndex = 4;
            // 
            // tbEmployeeID
            // 
            tbEmployeeID.Location = new Point(12, 115);
            tbEmployeeID.Name = "tbEmployeeID";
            tbEmployeeID.Size = new Size(126, 23);
            tbEmployeeID.TabIndex = 5;
            // 
            // btnOK
            // 
            btnOK.Location = new Point(159, 102);
            btnOK.Name = "btnOK";
            btnOK.Size = new Size(144, 36);
            btnOK.TabIndex = 6;
            btnOK.Text = "OK";
            btnOK.UseVisualStyleBackColor = true;
            btnOK.Click += btnOK_Click;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(12, 55);
            label1.Name = "label1";
            label1.Size = new Size(52, 15);
            label1.TabIndex = 7;
            label1.Text = "Empresa";
            // 
            // lb1
            // 
            lb1.AutoSize = true;
            lb1.Location = new Point(12, 99);
            lb1.Name = "lb1";
            lb1.Size = new Size(60, 15);
            lb1.TabIndex = 8;
            lb1.Text = "Empleado";
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(159, 57);
            label4.Name = "label4";
            label4.Size = new Size(38, 15);
            label4.TabIndex = 10;
            label4.Text = "Salida";
            // 
            // label5
            // 
            label5.AutoSize = true;
            label5.Location = new Point(12, 5);
            label5.Name = "label5";
            label5.Size = new Size(126, 15);
            label5.TabIndex = 11;
            label5.Text = "Nombre del empleado";
            // 
            // lbProgramming
            // 
            lbProgramming.FormattingEnabled = true;
            lbProgramming.ItemHeight = 15;
            lbProgramming.Location = new Point(12, 225);
            lbProgramming.Name = "lbProgramming";
            lbProgramming.Size = new Size(291, 124);
            lbProgramming.TabIndex = 12;
            // 
            // label6
            // 
            label6.AutoSize = true;
            label6.Location = new Point(11, 178);
            label6.Name = "label6";
            label6.Size = new Size(82, 15);
            label6.TabIndex = 13;
            label6.Text = "Programación";
            // 
            // btnDel
            // 
            btnDel.Location = new Point(244, 23);
            btnDel.Name = "btnDel";
            btnDel.Size = new Size(59, 23);
            btnDel.TabIndex = 14;
            btnDel.Text = "DEL";
            btnDel.UseVisualStyleBackColor = true;
            // 
            // cb1
            // 
            cb1.AutoSize = true;
            cb1.Location = new Point(12, 144);
            cb1.Name = "cb1";
            cb1.Size = new Size(32, 19);
            cb1.TabIndex = 15;
            cb1.Text = "L";
            cb1.UseVisualStyleBackColor = true;
            // 
            // cb2
            // 
            cb2.AutoSize = true;
            cb2.Location = new Point(50, 144);
            cb2.Name = "cb2";
            cb2.Size = new Size(37, 19);
            cb2.TabIndex = 16;
            cb2.Text = "M";
            cb2.UseVisualStyleBackColor = true;
            // 
            // cb3
            // 
            cb3.AutoSize = true;
            cb3.Location = new Point(93, 144);
            cb3.Name = "cb3";
            cb3.Size = new Size(33, 19);
            cb3.TabIndex = 17;
            cb3.Text = "X";
            cb3.UseVisualStyleBackColor = true;
            // 
            // cb4
            // 
            cb4.AutoSize = true;
            cb4.Location = new Point(132, 144);
            cb4.Name = "cb4";
            cb4.Size = new Size(30, 19);
            cb4.TabIndex = 18;
            cb4.Text = "J";
            cb4.UseVisualStyleBackColor = true;
            // 
            // cb5
            // 
            cb5.AutoSize = true;
            cb5.Location = new Point(168, 144);
            cb5.Name = "cb5";
            cb5.Size = new Size(33, 19);
            cb5.TabIndex = 19;
            cb5.Text = "V";
            cb5.UseVisualStyleBackColor = true;
            // 
            // cb6
            // 
            cb6.AutoSize = true;
            cb6.Location = new Point(207, 144);
            cb6.Name = "cb6";
            cb6.Size = new Size(32, 19);
            cb6.TabIndex = 20;
            cb6.Text = "S";
            cb6.UseVisualStyleBackColor = true;
            // 
            // cb7
            // 
            cb7.AutoSize = true;
            cb7.Location = new Point(245, 144);
            cb7.Name = "cb7";
            cb7.Size = new Size(34, 19);
            cb7.TabIndex = 21;
            cb7.Text = "D";
            cb7.UseVisualStyleBackColor = true;
            // 
            // deleteAll
            // 
            deleteAll.Location = new Point(207, 355);
            deleteAll.Name = "deleteAll";
            deleteAll.Size = new Size(96, 23);
            deleteAll.TabIndex = 22;
            deleteAll.Text = "Nueva Semana";
            deleteAll.UseVisualStyleBackColor = true;
            deleteAll.Click += deleteAll_Click;
            // 
            // btnDelSelected
            // 
            btnDelSelected.Location = new Point(12, 355);
            btnDelSelected.Name = "btnDelSelected";
            btnDelSelected.Size = new Size(52, 23);
            btnDelSelected.TabIndex = 23;
            btnDelSelected.Text = "Borrar";
            btnDelSelected.UseVisualStyleBackColor = true;
            btnDelSelected.Click += btnDelSelected_Click;
            // 
            // cbLastPrograming
            // 
            cbLastPrograming.FormattingEnabled = true;
            cbLastPrograming.Location = new Point(12, 196);
            cbLastPrograming.Name = "cbLastPrograming";
            cbLastPrograming.Size = new Size(291, 23);
            cbLastPrograming.TabIndex = 24;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(315, 387);
            Controls.Add(cbLastPrograming);
            Controls.Add(btnDelSelected);
            Controls.Add(deleteAll);
            Controls.Add(cb7);
            Controls.Add(cb6);
            Controls.Add(cb5);
            Controls.Add(cb4);
            Controls.Add(cb3);
            Controls.Add(cb2);
            Controls.Add(cb1);
            Controls.Add(btnDel);
            Controls.Add(label6);
            Controls.Add(lbProgramming);
            Controls.Add(label5);
            Controls.Add(label4);
            Controls.Add(lb1);
            Controls.Add(label1);
            Controls.Add(btnOK);
            Controls.Add(tbEmployeeID);
            Controls.Add(dtpOutTime);
            Controls.Add(tbEnterpriseID);
            Controls.Add(tbEmployeeName);
            Name = "Form1";
            Text = "Form1";
            Activated += Form1_Activated;
            Load += Form1_Load;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox tbEmployeeName;
        private TextBox tbEnterpriseID;
        private DateTimePicker dtpOutTime;
        private TextBox tbEmployeeID;
        private Button btnOK;
        private Label label1;
        private Label lb1;
        private Label label4;
        private Label label5;
        private ListBox lbProgramming;
        private Label label6;
        private Button btnDel;
        private CheckBox cb1;
        private CheckBox cb2;
        private CheckBox cb3;
        private CheckBox cb4;
        private CheckBox cb5;
        private CheckBox cb6;
        private CheckBox cb7;
        private Button deleteAll;
        private Button btnDelSelected;
        private ComboBox cbLastPrograming;
    }
}
