import React, { useState, useEffect } from 'react';
import {
    User, Calendar, Phone, MapPin, Heart, Activity, FileText,
    CreditCard, Check, ChevronRight, ChevronLeft, Upload, Search, Bed, Edit3, Plus, Trash2
} from 'lucide-react';
import DynamicForm from './components/DynamicForm';
import axios from 'axios';
import { indianStates, getDistrictsForState, getCitiesForDistrict } from './locationData';

const AdmissionRegistration = ({ generateMemberId, onSearch, currentStep, onStepChange }) => {
    const [internalStep, setInternalStep] = useState(1);
    const step = currentStep !== undefined ? currentStep : internalStep;
export default AdmissionRegistration;
