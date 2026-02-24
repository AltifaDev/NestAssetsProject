export interface Media {
  id: string;
  url: string;
  type: string;
  uploaded_by: string;
  related_to?: string;
  related_id?: string;
  status: string;
  created_at: Date;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  media_id: string;
  tag?: string;
  caption?: string;
  display_order: number;
  created_at: Date;
}
