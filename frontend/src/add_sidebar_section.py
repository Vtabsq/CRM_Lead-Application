import re

# Read the file
with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add patientAdmissionCare to expandedSections state
content = content.replace(
    "'homeCare': true,",
    "'homeCare': true,\n        'patientAdmissionCare': true,"
)

# Find the Home Care section and add Patient Admission section after it
home_care_section = '''                    </div>

                    {/* MANAGEMENT SECTION */}'''

patient_admission_section = '''                    </div>

                    {/* PATIENT ADMISSION CARE SECTION */}
                    <div>
                        <SectionHeader
                            id="patientAdmissionCare"
                            icon={Activity}
                            label="Patient Admission"
                            isExpanded={expandedSections['patientAdmissionCare']}
                            onClick={() => {
                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                    setExpandedSections(prev => ({ ...prev, 'patientAdmissionCare': true }));
                                } else {
                                    toggleSection('patientAdmissionCare');
                                }
                            }}
                        />
                        {!isCollapsed && expandedSections['patientAdmissionCare'] && (
                            <div className="mt-2 space-y-1">
                                <NavItem icon={User} label="Clients" path="/patientadmission/clients" isSubItem={true} />
                                <NavItem icon={TrendingUp} label="Billing Preview" path="/patientadmission/billing-preview" isSubItem={true} />
                            </div>
                        )}
                    </div>

                    {/* MANAGEMENT SECTION */}'''

content = content.replace(home_care_section, patient_admission_section)

# Write back
with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Patient Admission section to Sidebar.jsx successfully!")
