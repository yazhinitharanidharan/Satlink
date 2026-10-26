
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class SessionCreate(BaseModel):
    window_id: int = Field(gt=0)
    antenna_id: int = Field(gt=0)
    station_id: int = Field(gt=0)
    frequency: int = Field(gt=0)
    scheduled_start: datetime
    scheduled_end: datetime

    @model_validator(mode="after")
    def validate_times(self):
        if self.scheduled_end <= self.scheduled_start:
            raise ValueError(
                "Scheduled end must be after scheduled start"
            )
        return self

from datetime import date
from typing import Optional


class SatelliteCreate(BaseModel):
    satellite_name: str = Field(min_length=1, max_length=150)
    orbit_type: Optional[str] = Field(default=None, max_length=50)
    launch_date: Optional[date] = None
    health_status: str = Field(default="Active", max_length=30)
    mission_id: int = Field(gt=0)


class SatelliteUpdate(BaseModel):
    satellite_name: str = Field(min_length=1, max_length=150)
    orbit_type: Optional[str] = Field(default=None, max_length=50)
    launch_date: Optional[date] = None
    health_status: str = Field(default="Active", max_length=30)
    mission_id: int = Field(gt=0)
