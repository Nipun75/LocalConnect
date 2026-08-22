import React, { useState } from 'react';
import { ParsedRequirement } from '@/types/ai';
import { MapPin, DollarSign, Calendar, BookOpen, Clock, Edit2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface RequirementSummaryChipsProps {
  requirement: ParsedRequirement;
  onUpdateRequirement?: (updated: ParsedRequirement) => void;
  editable?: boolean;
}

export const RequirementSummaryChips: React.FC<RequirementSummaryChipsProps> = ({
  requirement,
  onUpdateRequirement,
  editable = true,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartEdit = (field: string, initialVal: string) => {
    if (!editable) return;
    setEditingField(field);
    setTempValue(initialVal);
  };

  const handleSaveEdit = (field: string) => {
    if (!onUpdateRequirement) return;
    const updated = { ...requirement };

    if (field === 'budget') {
      const num = parseInt(tempValue.replace(/[^\d]/g, ''), 10);
      if (!isNaN(num)) {
        updated.budget = { ...updated.budget, max: num };
      }
    } else if (field === 'radius') {
      const num = parseInt(tempValue.replace(/[^\d]/g, ''), 10);
      if (!isNaN(num)) {
        updated.location = { ...updated.location, radius_km: num };
      }
    } else if (field === 'service') {
      updated.service = tempValue;
    } else if (field === 'schedule') {
      updated.schedule = { ...updated.schedule, date: tempValue };
    }

    onUpdateRequirement(updated);
    setEditingField(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Service / Skill Chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
        <BookOpen className="w-4 h-4" />
        {editingField === 'service' ? (
          <div className="flex items-center gap-1">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="h-6 w-32 px-1 text-xs bg-white text-foreground"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit('service')}
            />
            <button onClick={() => handleSaveEdit('service')} className="p-0.5 hover:bg-primary/20 rounded">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span
            onClick={() => handleStartEdit('service', requirement.service)}
            className={editable ? 'cursor-pointer hover:underline' : ''}
            title={editable ? 'Click to edit' : undefined}
          >
            {requirement.level_or_type ? `${requirement.level_or_type} ` : ''}
            {requirement.service}
          </span>
        )}
      </div>

      {/* Location & Radius Chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground text-sm font-medium">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        {editingField === 'radius' ? (
          <div className="flex items-center gap-1">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="h-6 w-20 px-1 text-xs bg-white text-foreground"
              autoFocus
              placeholder="e.g. 5 km"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit('radius')}
            />
            <button onClick={() => handleSaveEdit('radius')} className="p-0.5 hover:bg-muted rounded">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span
            onClick={() => handleStartEdit('radius', `${requirement.location.radius_km} km`)}
            className={editable ? 'cursor-pointer hover:underline' : ''}
            title={editable ? 'Click to edit radius' : undefined}
          >
            {requirement.location.name} (within {requirement.location.radius_km} km)
          </span>
        )}
      </div>

      {/* Budget Chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground text-sm font-medium">
        <DollarSign className="w-4 h-4 text-emerald-600" />
        {editingField === 'budget' ? (
          <div className="flex items-center gap-1">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="h-6 w-20 px-1 text-xs bg-white text-foreground"
              autoFocus
              placeholder="e.g. 500"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit('budget')}
            />
            <button onClick={() => handleSaveEdit('budget')} className="p-0.5 hover:bg-muted rounded">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span
            onClick={() => handleStartEdit('budget', requirement.budget.max ? `₹${requirement.budget.max}` : '500')}
            className={editable ? 'cursor-pointer hover:underline' : ''}
            title={editable ? 'Click to edit budget' : undefined}
          >
            {requirement.budget.max
              ? `₹${requirement.budget.max} / ${requirement.budget.unit}`
              : 'Flexible Budget'}
          </span>
        )}
      </div>

      {/* Schedule / Days Chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground text-sm font-medium">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span>
          {requirement.schedule.days && requirement.schedule.days.length > 0
            ? requirement.schedule.days.join(' & ')
            : requirement.schedule.date || 'Flexible Time'}
          {requirement.schedule.time_slot ? ` (${requirement.schedule.time_slot})` : ''}
        </span>
      </div>

      {/* Urgency Badge */}
      {requirement.urgency === 'urgent' && (
        <Badge variant="destructive" className="flex items-center gap-1 px-2.5 py-1">
          <Clock className="w-3 h-3" />
          Urgent Request
        </Badge>
      )}

      {editable && !editingField && (
        <span className="text-xs text-muted-foreground ml-1 flex items-center gap-1 opacity-70">
          <Edit2 className="w-3 h-3" /> Click any tag to edit
        </span>
      )}
    </div>
  );
};
